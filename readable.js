/** readable - A minimal, conservative rendering for mere readability
  *
  * See readable.css for an introduction.  This script begins executing at function *run*.
  */
'use strict';
( function()
{


////  L e x i c a l l y   u n o r d e r e d   d e c l a r a t i o n s  /////////////////////////////////



    /** The leading string of all (URL form) wayscript namespaces.  A full XML namespace is formed
      * in each case by appending a subnamespace.
      */
    const NS_WAYSCRIPT_DOT = 'data:,wayscript.';

    const NS_WAYSCRIPT_DOT_LENGTH = NS_WAYSCRIPT_DOT.length;



    const SHOW_ELEMENT = NodeFilter.SHOW_ELEMENT;



    /** The subnamespace of markup specific to waybits simply, excluding other waybits (such as steps).
      *
      *     @see #NS_WAYSCRIPT_DOT
      *     @see #NS_BIT
      */
    const SUB_NS_BIT = 'bit';



    /** The subnamespace of markup specific to cogs.
      *
      *     @see #NS_WAYSCRIPT_DOT
      *     @see #NS_COG
      */
    const SUB_NS_COG = 'cog';



    const SUB_NS_STEP = 'bit.step';



    /** The XML namespace of markup specific to cogs.
      */
    const NS_COG  = NS_WAYSCRIPT_DOT + SUB_NS_COG;



   // ==================================================================================================


    /** Dealing with Uniform Resource Identifiers.
      *
      *     @see https://tools.ietf.org/html/rfc3986
      */
    const URIs = ( function()
    {

        const that = {}; // the public interface of URIs



        const hrefParserDiv = document.createElement( 'div' ); hrefParserDiv.innerHTML = '<a/>';



       // - P u b l i c --------------------------------------------------------------------------------


        /** The pattern of a full URI (as opposed to a URI reference)
          * which means a URI with a scheme component.
          *
          *     @see https://tools.ietf.org/html/rfc3986#section-1.1.1
          *     @see https://tools.ietf.org/html/rfc3986#section-3
          *     @see https://tools.ietf.org/html/rfc3986#section-3.1
          */
        that.FULL_PATTERN = new RegExp( '^[A-Za-z0-9][A-Za-z0-9+.-]*:' );



        /** Answers whether the given URI is detected to have an abnormal form,
          * where such detection depends on whether *toEnforceCostlyConstraints*.
          *
          *     @see #normalize
          */
        that.isDetectedAbnormal = function( uri )
        {
            return toEnforceCostlyConstraints && uri != that.normalize(uri)
        }



        /** Returns a message that the given URI is not in normal form.
          */
        that.message_abnormal = function( uri ) { return 'Not in normal form:' + uri; };



        /** Puts the given URI reference through the client's hyperlink *href* parser,
          * thus converting any relative path to an absolute path (by resolving it against
          * the location of the present document) and otherwise normalizing its form.
          * Returns the normalized form.
          *
          *     @see URI-reference, https://tools.ietf.org/html/rfc3986#section-4.1
          */
        that.normalize = function( ref )
        {
            // Modified from Matt Mastracci.
            // https://grack.com/blog/2009/11/17/absolutizing-url-in-javascript/
            //
            // Apparently this cannot be adapted for use with other documents, to normalize their own,
            // internally encoded references.  At least it fails when an equivalent function is
            // constructed (with parser element, etc.) against another document obtained through the
            // Documents reading facility.  Then the *href* always yields *undefined*.

            const div = hrefParserDiv;
            div.firstChild.href = ref; // escaping ref en passant
            div.innerHTML = div.innerHTML; // reparsing it
            return div.firstChild.href;
        };



       // - - -

        return that;

    }() );



////  S i m p l e   d e c l a r a t i o n s  ///////////////////////////////////////////////////////////



    /** The default message for console assertions.
      */
    const A = 'Failed assertion';



    /** Returns a string to represent an attribute declaration.
      */
    function a2s( name, value ) { return  name + "='" + value + "'"; }



    /** The message prefix for console assertions.
      */
    const AA = A + ': ';



 // /** Appends one or more class names to the given element's style class.
 //   *
 //   *     @param names (string) The space-separated names to append.
 //   */
 // function appendToStyleClass( element, names )
 // {
 //     var existingNames = element.className;
 //     element.className = existingNames? existingNames + ' ' + names: names );
 // }



    const BROKEN_SYMBOL = '⋯!⋯'; // '—' is Unicode 2014 (em dash), '⋯' 22ef (midline horizontal ellipsis)



    /** The location of the waycast (string) in normal URL form, and with a trailing slash '/'.
      *
      *     @see URIs#normalize
      */
    let CAST_BASE_LOCATION; // init below, thence constant



    /** The path to the base (root directory) of the waycast, without a trailing slash '/'.
      */
    const CAST_BASE_PATH = ( function()
    {
        let path = '__UNDEFINED_repo_href__';
        const traversal = document.createTreeWalker( document.head, SHOW_ELEMENT );
        for( let t = traversal.nextNode(); t != null; t = traversal.nextSibling() )
        {
            if( t.localName == 'cast' && t.namespaceURI == NS_COG )
            {
                const p = t.getAttribute( 'base' );
                if( p )
                {
                    path = p;
                    while( path.endsWith('/') ) path = path.slice( 0, -1 ); // remove the trailing slash
                }
                else mal( "Missing 'base' attribute in 'cast' element" );
                return path;
            }
        }

        mal( "Missing 'cast' element in document 'head'" );
        return path;
    }() );


        {
            let loc = URIs.normalize( CAST_BASE_PATH );
            console.assert( !loc.includes('..'), A );
            if( !loc.endsWith('/') ) loc = loc + '/';
            CAST_BASE_LOCATION = loc;
        }



    const COMMENT = Node.COMMENT_NODE;



    /** Configures a waylink source node for a given target node.
      *
      * @param sourceNS (string) The namespace of the source node.
      * @param sourceLocalPart (string) The local part of the source node's name.
      * @param linkV (string) The value of the source node's *link* attribute.
      * @param isBit (boolean) Whether the source node is a waybit.
      * @param target (Element) The target node.  The target node may be situated in this document,
      *   or a separate document in the case of an external link.
      * @param rendering (PartRenderingC)
      */
    function configureForTarget( sourceNS, sourceLocalPart, linkV, isBit, target, rendering )
    {
        const targetNS = target.namespaceURI;
        const targetLocalPart = target.localName;
        let isMalNameReported = false;
        if( sourceNS != targetNS )
        {
            mal( 'Source node namespace (' + sourceNS + ') differs from target node namespace ('
              + targetNS + ') for waylink: ' + a2s('link',linkV) );
            isMalNameReported = true;
        }
        if( !isMalNameReported && !isBit && sourceLocalPart != targetLocalPart )
        {
            mal( 'Source node name (' + sourceLocalPart + ') differs from target node name ('
              + targetLocalPart + ') for waylink: ' + a2s('link',linkV) );
        }
        if( isBit && sourceLocalPart == ELEMENT_NAME_UNCHANGED ) rendering.localPartOverride = targetLocalPart;
          // thus rendering it with the same name as the target
    }



    /** Configures a waylink source node for a given target preview.
      */
    function configureForTargetPreview( source, forelinker, targetPreviewString )
    {
        if( targetPreviewString.length == 0 )
        {
            source.removeAttributeNS( NS_REND, 'hasPreviewString' );
            forelinker.className = 'shortContent';
        }
        else
        {
            source.setAttributeNS( NS_REND, 'hasPreviewString', 'hasPreviewString' );
            if( targetPreviewString.length <= 2 ) forelinker.className = 'shortContent';
            else
            {
                const c = forelinker.className;
                if( c )
                {
                    console.assert( c == 'shortContent', A ); // removing only that one
                    forelinker.removeAttribute( 'class' );
                }
            }
        }
    };



    const ELEMENT = Node.ELEMENT_NODE;



    /** The string that means *none* when it encodes the local part of a wayscript element's name.
      */
    const ELEMENT_NAME_NONE = '_';



    /** The string that means *same as the target name* when it encodes the local part of the name
      * of a waylink souce node.
      */
    const ELEMENT_NAME_UNCHANGED = '_iso';



    const DELAY_SYMBOL = '⌚'; // '⌚' is Unicode 231a (watch)



    /** The location of present document (string) in normal URL form.
      *
      *     @see URIs#normalize
      */
    const DOCUMENT_LOCATION = ( function()
    {
        let loc = window.location.toString();
        const hashLength = window.location.hash.length; // [WDL], including the '#' character
        if( hashLength ) loc = loc.slice( 0, -hashLength );
        return URIs.normalize( loc );
    }() );



    /** Returns the first child of the given node that is a waybit.
      */
    function firstWaybitChild( node )
    {
        const traversal = document.createTreeWalker( node, SHOW_ELEMENT );
        let t = traversal.nextNode();
        for(; t != null; t = traversal.nextSibling() ) if( isBitNS( t.namespaceURI )) return t;
        return null;
    }



    /** Tries quickly to find a target node by the *id* attribute which this script sets on it.
      * Returns the target node for the given *id*, or null if this script has yet to set it.
      */
    function getTargetById( id ) { return Documents.getTargetById( document, id ); }



    /** Answers whether ns is a namespace of waybits.  That means either NS_BIT itself
      * or another namespace that starts with NS_BIT and a dot separator.
      * The only other defined at present is NS_STEP.
      *
      *     @param ns (string)
      */
    function isBitNS( ns )
    {
        const nsBitLen = NS_BIT.length;
        return ns.startsWith(NS_BIT) && (ns.length == nsBitLen || ns.charAt(nsBitLen) == '.');
    }



    /** Answers whether subNS is a subnamespace of waybits.  That means either 'bit' itself
      * or another subnamespace that starts with "bit.".
      *
      *     @param subNS (string) A wayscript namespace without the leading NS_WAYSCRIPT_DOT.
      */
    function isBitSubNS( subNS )
    {
        return subNS.startsWith(SUB_NS_BIT) && (subNS.length == 3 || subNS.charAt(3) == '.');
    }



    /** Whether the present document appears to be stored on the user's computer or local network.
      */
    const isDocumentLocallyStored = document.URL.startsWith( 'file:' );



    /** Whether it appears that the user would be unable to correct faults in this program.
      */
    const isUserNonProgrammer = !isDocumentLocallyStored;



    /** Whether the user can likely edit the present document.
      */
    const isUserScribe = isDocumentLocallyStored;



    /** Returns the last descendant of the given node, or null if the node is empty.
      */
    function lastDescendant( node )
    {
        do node = node.lastChild;
        while( node.hasChildNodes() );
        return node;
    }



    /** Moves the current node of the tree walker to the last *visible* node within the current node,
      * and returns the found node.  It also moves the current node to this node.
      * If no such node exists, returns null and the current node is not changed.
      */
    function lastNode( treeWalker )
    {
        const origin = treeWalker.currentNode;
        while( treeWalker.lastChild() ) {}
        const destination = treeWalker.currentNode;
        return destination == origin? null: destination;
    }



    /** Reports malformed wayscript, or any other problem that a user with write access
      * to the document might be able to redress.
      */
    function mal( message )
    {
        if( !message ) throw "Null parameter";

        console.error( message );
        if( isUserScribe ) alert( message ); // see readable.css § DEBUGGING
    }



    const MYSTERY_SYMBOL = '⋯?⋯'; // '⋯' is Unicode 22ef (midline horizontal ellipsis)



    /** The XML namespace of waybits simply, excluding subspaced waybits such as steps.
      */
    const NS_BIT  = NS_WAYSCRIPT_DOT + SUB_NS_BIT;



    /** The XML namespace of HTML.
      */
    const NS_HTML = 'http://www.w3.org/1999/xhtml';



    /** The XML namespace of markup specific to this renderer.
      */
    const NS_REND = 'data:,wayic.read';



    /** The XML namespace of steps.
      */
    const NS_STEP = NS_WAYSCRIPT_DOT + SUB_NS_STEP;



    /** Reads the previewable text content of the given target node.
      *
      *     @param target (Element) The waylink target node.
      *
      *     @return (string) The previewable text content for setting in the *preview* element,
      *       or an empty string if there is none.
      */
    function readTargetPreview( target )
    {
        LeaderReader.read( target );
        return LeaderReader.leader;
    }



    /** Runs this script.
      */
    function run()
    {
        console.assert( (eval('var _tmp = null'), typeof _tmp === 'undefined'), AA + 'Strict mode' );
          // http://www.ecma-international.org/ecma-262/6.0/#sec-strict-mode-code
          // credit Noseratio, https://stackoverflow.com/a/18916788/2402790
        Styler.run();
        transform();
      // --------------------
      // Layout is now stable  (more or less)
      // --------------------
        document.body.style.display = 'block'; // overriding readable.css in order to lay out and show the page
        ExternalWaylinkResolver.start();
        WayTracer.start(); // start late, AFTER_TARGETS_IDD
    }




    /** The maximum number of characters in a forelinker target preview.
      */
    const TARGET_PREVIEW_MAX_LENGTH = 36;



    const TEXT = Node.TEXT_NODE;



    /** Whether to enforce program constraints whose violations are expensive to detect.
      */
    const toEnforceCostlyConstraints = !isUserNonProgrammer;



    /** Tranforms the document.
      */
    function transform()
    {
        const body = document.body;
        const traversal = document.createTreeWalker( body, SHOW_ELEMENT, {
            acceptNode: function( node )
            {
                if( node.namespaceURI == NS_REND ) return NodeFilter.FILTER_REJECT; /* bypassing this
                  branch, which was introduced in an earlier iteration and needs no more transforming */

                return NodeFilter.FILTER_ACCEPT;
            }
        });
        tt: for( ;; )
        {
            const t = traversal.nextNode();
            if( t == null ) break;

            const tNS = t.namespaceURI;
            const tLocalPart = t.localName;
            let isBit, isHTML, isWayscript;
            let tSubNS; // wayscript subnamespace, or null if element t is not wayscript
            if( tNS.startsWith( NS_WAYSCRIPT_DOT )) // then element t is wayscript
            {
                isHTML = false;
                isWayscript = true;
                t.setAttributeNS( NS_REND, 'isWayscript', 'isWayscript' );
                tSubNS = tNS.slice( NS_WAYSCRIPT_DOT_LENGTH );
                isBit = isBitSubNS( tSubNS );
            }
            else // element t is non-wayscript
            {
                isHTML = tNS == NS_HTML;
                isBit = isWayscript = false;
                tSubNS = null;
            }

          // ============
          // Form testing of element t
          // ============
            function waylinkAttributeV( attrName ) // returns its value, or null
            {
                let v = t.getAttributeNS( NS_COG, attrName );
                if( !v ) return null;

                if( !isBit )
                {
                    mal( 'A non-waybit element with a waylink attribute: ' + a2s(attrName,v) );
                    v = null;
                }
                return v;
            }
            const lidV = waylinkAttributeV( 'lid' ); // target identifier, non-null if t is a target node
            const linkV = waylinkAttributeV( 'link' ); // waylink declaration, non-null if t is a source node

          // ===================
          // Hyperlink targeting by element t
          // ===================
            if( isHTML && tLocalPart == 'a' )
            {
                const href = t.getAttribute( 'href' );
                if( href.startsWith( '/' )) t.setAttribute( 'href', CAST_BASE_PATH + href );
                  // translating waycast space → universal space
            }

            if( !isWayscript ) continue tt;


          ///////////////////////////////////////////////////////////////////////////////////  WAYSCRIPT

            const isDeclaredEmpty = !t.hasChildNodes();
            if( tSubNS == SUB_NS_STEP )
            {
                const textAligner = document.createElementNS( NS_REND, 'textAligner' );
                t.insertBefore( textAligner, t.firstChild );
            }
            if( isBit ) t.setAttributeNS( NS_REND, 'isWaybit', 'isWaybit' );
            const rendering = new PartRenderingC( t );


          // ==========
          // Waylinkage of element t
          // ==========
            source: if( linkV )
            {
                if( !isDeclaredEmpty ) // then it's a tagless declaration of a source node
                {
                  // Translate tagless declaration → entagment
                  // -----------------------------------------
                    const entagment = document.createElementNS( NS_BIT, ELEMENT_NAME_UNCHANGED );
                    t.insertBefore( entagment, firstWaybitChild(t) ); // [EP]
                    entagment.setAttributeNS( NS_COG, 'link', linkV );
                         t.removeAttributeNS( NS_COG, 'link' );
                    entagment.setAttributeNS( NS_REND, 'isEntagment', 'isEntagment' ); // if only as debug aid
                    break source; // leave it to be processed by a later iteration
                }

                if( lidV )
                {
                    mal( "Waylink node has both 'lid' and 'link' attributes: " + a2s('lid',lidV) );
                    break source;
                }

                let link;
                try { link = new LinkAttribute( linkV ); }
                catch( unparseable )
                {
                    mal( unparseable );
                    break source;
                }

                const preview = document.createElementNS( NS_REND, 'preview' );
                const targetDocLoc = link.targetDocumentLocation;
                let targetPreviewString, targetDirectionChar;
                targeting:
                {
                    if( targetDocLoc.length > 0 )
                    {
                        const targetDocLocN = URIs.normalize( targetDocLoc );
                        if( targetDocLocN != DOCUMENT_LOCATION ) // then the target is outside this document
                        {
                            ExternalWaylinkResolver.registerLink( t, targetDocLocN );
                            targetDirectionChar = '→'; // '→' is Unicode 2192 (rightwards arrow)
                            rendering.isChangeable = true;
                            targetPreviewString = DELAY_SYMBOL;
                            break targeting;
                        }
                    }

                    // the target is within this document
                    let target = getTargetById( link.targetID );
                    if( target ) targetDirectionChar = '↑'; // '↑' is Unicode 2191 (upwards arrow)
                    else // it should be in nodes below, where transform has yet to reach it and set its 'id'
                    {
                        const traversal = document.createTreeWalker( body, SHOW_ELEMENT ); // search for it
                        let u = lastNode( traversal );        // from last node
                        for(;; u = traversal.previousNode() ) // travel upward
                        {
                            if( u == t ) // then search is on this node, about to revisit the nodes above
                            {
                                mal( "Broken link: Either this document has no matching 'lid', "
                                  + 'or it has an identifier conflict: ' + a2s('link',linkV) );
                                targetDirectionChar = '↕'; // '↕' is Unicode 2195 (up down arrow)
                                targetPreviewString = BROKEN_SYMBOL;
                                break targeting;
                            }

                            if( u.getAttributeNS(NS_COG,'lid') == link.targetID )
                            {
                                target = u;
                                targetDirectionChar = '↓'; // '↓' is Unicode 2193 (downwards arrow)
                                break;
                            }
                        }
                    }

                    configureForTarget( tNS, tLocalPart, linkV, isBit, target, rendering );
                    targetPreviewString = readTargetPreview( target );
                }
                const forelinker = t.appendChild( document.createElementNS( NS_REND, 'forelinker' ));
                const a = forelinker.appendChild( document.createElementNS( NS_HTML, 'a' ));
                a.setAttribute( 'href', targetDocLoc + '#' + link.targetID );
                a.appendChild( preview );
                preview.appendChild( document.createTextNode( targetPreviewString ));
                configureForTargetPreview( t, forelinker, targetPreviewString );
                a.appendChild( document.createElementNS( NS_HTML, 'br' ));
                a.appendChild( document.createElementNS( NS_REND, 'verticalTruncator' ))
                  .appendChild( document.createTextNode( '⋱⋱' )); // alternatives ⋮ ⋱
                a.appendChild( document.createElementNS( NS_REND, 'directionIndicator' ))
                  .appendChild( document.createTextNode( targetDirectionChar ));
            }


         // =========
         // Start tag of element t
         // =========
            rendering.render();
            const eSTag = rendering.eSTag;
            if( lidV ) // then t is a waylink target node
            {
              // Hyperlink targeting
              // -------------------
                Documents.targetAsHyperlinkToo( t, lidV );

              // Self hyperlink
              // --------------
                const a = document.createElementNS( NS_HTML, 'a' );
                const eQName = eSTag.firstChild;
                eSTag.insertBefore( a, eQName );
                a.appendChild( document.createElementNS( NS_REND, 'targetMarker' ))
                 .appendChild( document.createTextNode( '→' )); // '→' is Unicode 2192 (rightwards arrow)
                a.appendChild( eQName ); // wrap it

              // ---
                Targets.initTarget( eSTag, t, lidV );
            }
            else if( tSubNS == SUB_NS_COG && (tLocalPart == 'comprising' || tLocalPart == 'including'))
            {
                t.setAttributeNS( NS_REND, 'isComposer', 'isComposer' );

              // Composition leader alignment  (see readable.css)
              // ----------------------------
                console.assert( LeaderReader.element == t, A );
                alignment: if( LeaderReader.hasLeader )
                {
                    let n = eSTag.nextSibling; /* Whether special alignment is needed depends on the
                      node that follows the start tag. */
                    let type = n.nodeType;
                    function isNonethelessSafeToMove() // though type ≠ TEXT, an assumption here
                    {
                        return type == COMMENT || type == ELEMENT && n.namespaceURI == NS_HTML;
                    }

                    if( type == TEXT )
                    {
                        const cc = n.data; // leading characters
                        if( cc.length == 0 )
                        {
                            console.assert( false, A );
                            break alignment;
                        }

                        const c = cc.charAt( 0 );
                        if( c == '\n' || c == '\r' ) break alignment; /* not in line with start tag,
                          needs no special alignment */
                    }
                    else if( !isNonethelessSafeToMove() ) break alignment;

                    // Let the leader align neatly with the content of the start tag as it would in
                    // the source.  Let it even *abut* the start tag (see the example in readable.css).
                    // Do this by shipping the leader nodes into the start tag.
                    const eQName = eSTag.firstChild;
                    do
                    {
                        const nNext = n.nextSibling;
                        eQName.appendChild( n );
                        n = nNext;
                        if( n == null ) break;

                        type = n.nodeType;
                    } while( type == TEXT || isNonethelessSafeToMove() );
                    n = lastDescendant( eQName ); // last node of the leader
                    if( n.nodeType == TEXT )
                    {
                        const trailer = n.data;
                        const m = trailer.match( /\s+$/ ); // trailing whitespace
                        if( m ) n.replaceData( m.index, trailer.length, '' );
                          // stripping it so that readable.css can neatly append a colon to eQName
                    }
                }
            }
        }
    }



    /** Answers whether the given HTML element is very likely to be rendered in line by the client.
      */
    function willDisplayInLine_likely( htmlElement ) // a workaround function for its caller, q.v.
    {
        switch( htmlElement.localName )
        {
            case 'a':
            case 'abbr':
            case 'b':
            case 'bdi':
            case 'bdo':
            case 'br':
            case 'cite':
            case 'code':
            case 'data':
            case 'del':
            case 'dfn':
            case 'em':
            case 'i':
            case 'ins':
            case 'kbd':
            case 'mark':
            case 'q':
            case 's':
            case 'samp':
            case 'small':
            case 'span':
            case 'strong':
            case 'sub':
            case 'sup':
            case 'u':
            case 'var':
            case 'wbr':
                return true;
        }

        return false;
    }



////  C o m p l i c a t e d   d e c l a r a t i o n s  /////////////////////////////////////////////////



    /** A reader of documents.
      */
    class DocumentReader
    {

        /** Closes this reader.
          *
          *     @param docReg (DocumentRegistration)
          */
        close( docReg ) {}


        /** Reads the document.
          *
          *     @param docReg (DocumentRegistration)
          *     @param doc (Document)
          */
        read( docReg, doc ) {}

    }



   // ==================================================================================================


    /** Dealing with wayscript documents at large, not only the present document.
      */
    const Documents = ( function()
    {

        const that = {}; // the public interface of Documents



        function d_mal( doc, message )
        {
            if( !doc ) throw "Null parameter";

            if( doc == document ) mal( message );
        }



        /** The generalized record of a wayscript document.
          */
        class DocumentRegistration
        {

            constructor( location, doc = null )
            {
                this._location = location;
                this._document = doc;
            }


            /** The registered document, or null if the document could not be retrieved.
              */
            get document() { return this._document; }
            set document( d ) { this._document = d; }


            /** The location of the document in normal form.
              */
            get location() { return this._location; }

        }



        function notifyReader( r, docReg, doc )
        {
            if( doc ) r.read( docReg, doc );
            r.close( docReg );
        }



        const PRESENT_DOCUMENT_REGISTRATION = new DocumentRegistration( DOCUMENT_LOCATION, document );



        /** Map of pending and complete document registrations, including that of the present document.
          * The entry key is DocumentRegistration#location.  The value is either the registration itself
          * or the readers (Array of DocumentReader) that await it.
          */
        const registry = new Map().set( DOCUMENT_LOCATION, PRESENT_DOCUMENT_REGISTRATION );



       // - P u b l i c --------------------------------------------------------------------------------


        /** Tries quickly to find a target node within the given document by its *id* attribute,
          * for which purpose it assumes (AFTER_TARGETS_IDD) that the *id* attribute is equal to
          * the *lid* attribute.  This assumption is guaranteed valid for any document *other than
          * the present document* that was retrieved through this (Documents) interface.
          *
          *     @param doc (Document)
          *     @param id (string)
          *
          *     @return The target node (Element) with the given *id*, or null if there is none.
          */
        that.getTargetById = function( doc, id )
        {
            let e = doc.getElementById( id );
            if( e )
            {
                const lidV = e.getAttributeNS( NS_COG, 'lid' );
                if( lidV == id ) return e;
            }

            return null;
        };



        /** Tries to retrieve the indicated document for the given reader.
          * If *docLoc* indicates the present document, then that is immediately passed to the reader.
          * Otherwise this method may return early, leaving the retrieval-read process to finish later.
          * On success, it calls reader.read; regardless, it always finishes by calling reader.close.
          *
          *     @param docLoc (string) The document location in normal URL form.
          *     @param reader (DocumentReader)
          *
          *     @see URIs#normalize
          */
        that.readNowOrLater = function( docLoc, reader )
        {
            if( URIs.isDetectedAbnormal( docLoc )) throw URIs.message_abnormal( docLoc );

            const entry = registry.get( docLoc );
            if( entry )
            {
                if( entry instanceof DocumentRegistration ) notifyReader( reader, entry, entry.document );
                else // registration is still pending
                {
                    console.assert( entry instanceof Array, A );
                    entry/*readers*/.push( reader ); // await the registration
                }
                return;
            }

            const readers = [];
            registry.set( docLoc, readers );
            readers.push( reader );

          // Configure a document request
          // ----------------------------
            const req = new XMLHttpRequest();
            req.open( 'GET', docLoc, /*asynchronous*/true ); // misnomer, opens nothing, only sets config
         // req.overrideMimeType( 'application/xhtml+xml' );
         /// still it parses to an XMLDocument (Firefox 52), unlike this document
            req.responseType = 'document';
            req.timeout = docLoc.startsWith('file:')? 2000: 8000; // ms

          // Stand by for the response
          // -------------------------
            {
                const docReg = new DocumentRegistration( docLoc );

              // abort
              // - - -
                req.onabort = function( e ) { console.warn( 'Document request aborted: ' + docLoc ); }

              // error
              // - - -
                /** @param e (Event) Unfortunately this is a mere ProgressEvent, at least on Firefox,
                  *   which contains no useful information on the specific cause of the error.
                  */
                req.onerror = function( e ) { console.warn( 'Document request failed: ' + docLoc ); }

              // load
              // - - -
                req.onload = function( e )
                {
                    // If this listener is registered instead by req.addEventListener,
                    // then oddly Firefox (52) rejects even in-branch local requests. [F]
                    const doc = e.target.response;
                    docReg.document = doc;

                  // Set the *id* attribute of each waylink target node
                  // ----------------------
                    const traversal = doc.createNodeIterator( doc, SHOW_ELEMENT );
                    for( ;; )
                    {
                        const t = traversal.nextNode();
                        if( t == null ) break;

                        const lidV = t.getAttributeNS( NS_COG, 'lid' );
                        if( lidV ) Documents.targetAsHyperlinkToo( t, lidV );
                    }
                };

              // load end
              // - - - - -
                /** @param e (Event) This is a mere ProgressEvent, at least on Firefox,
                  *   which itself contains no useful information.
                  */
                req.onloadend = function( e )
                {
                    // Parameter *e* is a ProgressEvent, which contains no useful information.
                    // If more information is ever needed, then it might be obtained from req.status,
                    // or the mere fact of a call to req.error (see listener req.onerror, above).

                  // Register the document
                  // ---------------------
                    registry.set( docLoc, docReg );

                  // Notify the waiting readers
                  // --------------------------
                    const doc = docReg.document;
                    for( const r of readers ) notifyReader( r, docReg, doc );
                }

              // time out
              // - - - - -
                req.ontimeout = function( e ) { console.warn( 'Document request timed out: ' + docLoc ); }
            }

          // Send the request
          // ----------------
            req.send();
        };



        /** Ensures that the given target node has one of the following: either
          * (1) an *id* attribute that is both equal to the *lid* attribute,
          *     and unique within its document, as required for an XML *ID* type; or
          * (2) no *id* attribute.
          *
          *     @param t (Element) A waylink target node.
          *     @param lidV (string) The value of t's *lid* attribute.
          */
        that.targetAsHyperlinkToo = function( t, lidV )
        {
            const doc = t.ownerDocument;
            const idV = t.getAttribute( 'id' );
            if( idV )
            {
                if( lidV == idV ) t.removeAttribute( 'id' ); // pending the getElementById check below
                else d_mal( doc, 'Element with ' + a2s('lid',lidV) + ' has non-matching ' + a2s('id',idV) );
            }
            const e = doc.getElementById( lidV );
            if( e ) d_mal( doc, 'Element with ' + a2s('lid',lidV) + ' has non-unique *id*' );
            else t.setAttribute( 'id', lidV );
        };



       // - - -

        return that;

    }() );




   // ==================================================================================================


    /** A device to complete the rendering of external waylinks, those whose target nodes are external
      * to this document.  It fetches external documents, reads their target nodes and amends
      * the rendered wayscript accordingly.
      */
    const ExternalWaylinkResolver = ( function()
    {

        const that = {}; // the public interface of ExternalWaylinkResolver



        function setTargetPreview( sourceNode, newPreviewString )
        {
            const forelinker = sourceNode.lastChild;
            const preview = forelinker.firstChild/*a*/.firstChild;
            const previewText = preview.firstChild;
            previewText.replaceData( 0, previewText.length, newPreviewString );
            configureForTargetPreview( sourceNode, forelinker, newPreviewString );
        }



        /** Map of source nodes to resolve.  The entry key is the location of a document (string)
          * in normal URL form.  The value is a list of all source nodes (Array of Element)
          * within the *present* document that target the *keyed* document.
          */
        const sourceNodeRegistry = new Map();



       // - P u b l i c --------------------------------------------------------------------------------


        /** Tells this resolver of an external link to be resolved.
          *
          *     @param sourceNode (Element) A source node that has an external target.
          *     @param targetDocLoc (string) The document location in normal URL form.
          *
          *     @see URIs#normalize
          */
        that.registerLink = function( sourceNode, targetDocLoc )
        {
            if( URIs.isDetectedAbnormal( targetDocLoc )) throw URIs.message_abnormal( targetDocLoc );

            let sourceNodes = sourceNodeRegistry.get( targetDocLoc );
            if( sourceNodes === undefined )
            {
                sourceNodes = [];
                sourceNodeRegistry.set( targetDocLoc, sourceNodes );
            }
            sourceNodes.push( sourceNode );
        };



        /** Starts this resolver.
          */
        that.start = function()
        {
            if( sourceNodeRegistry.size == 0 ) return;

            const NS_WAYSCRIPTISH = NS_WAYSCRIPT_DOT.slice( 0, 2 ); // enough for a quick, cheap test
            for( const entry of sourceNodeRegistry )
            {
                const targetDocLoc = entry[0];
                const sourceNodes = entry[1];
                Documents.readNowOrLater( targetDocLoc, new class extends DocumentReader
                {
                    close( docReg )
                    {
                        if( docReg.document == null )
                        {
                            for( const s of sourceNodes ) setTargetPreview( s, MYSTERY_SYMBOL );
                        }
                        sourceNodeRegistry.delete( targetDocLoc );
                    }

                    read( docReg, targetDoc )
                    {
                      // Try to resolve waylinks, re-rendering the source node of each
                      // -----------------------
                        const traversal = targetDoc.createNodeIterator( targetDoc, SHOW_ELEMENT );
                        tt: for( ;; ) // seek the target nodes in *that* document [EWR]
                        {
                            const target = traversal.nextNode();
                            if( !target ) break;

                            const lidV = target.getAttributeNS( NS_COG, 'lid' );
                            if( !lidV ) continue;

                            const lidVN = lidV.length;
                            let s = sourceNodes.length - 1;
                            ss: do // seek the source nodes in *this* document that match
                            {
                                const source = sourceNodes[s];
                                const linkV = source.getAttributeNS( NS_COG, 'link' );
                                if( !linkV.endsWith( lidV )
                                  || linkV.charAt(linkV.length-lidVN-1) != '#' ) continue ss;

                              // Amend the source node
                              // ---------------------
                                const sourceNS = source.namespaceURI;
                                const reRendering = new PartRenderingC2( source );
                                configureForTarget( sourceNS, source.localName, linkV, isBitNS(sourceNS),
                                  target, reRendering );
                                reRendering.render();
                                setTargetPreview( source, readTargetPreview(target) );

                              // De-register it
                              // --------------
                                sourceNodes.splice( s, /*removal count*/1 );
                                if( sourceNodes.length == 0 ) break tt; // done with this targetDoc

                            } while( --s >= 0 )
                        }

                      // Mark any remaining source nodes as broken
                      // -----------------------------------------
                        for( const s of sourceNodes )
                        {
                            const linkV = s.getAttributeNS( NS_COG, 'link' );
                            mal( "Broken link: No matching 'lid' in that document: " + a2s('link',linkV) );
                            setTargetPreview( s, BROKEN_SYMBOL );
                        }
                    }
                });
            }
        };



       // - - -

        return that;

    }() );



   // ==================================================================================================


    /** A reader of element leaders.  An element leader is the whitespace collapsed, text content
      * of the element prior to any contained element of wayscript or non-inline layout.
      *
      * <p>To learn merely whether an element has a leader of non-zero length, give a maxLength
      * of zero to the *read* function then inspect *hasLeader* for the answer.</p>
      */
    const LeaderReader = ( function()
    {

        const that = {}; // the public interface of LeaderReader



       // - P u b l i c --------------------------------------------------------------------------------


        /** The element whose leader was last read, or null if *read* has yet to be called.
          *
          *     @see #read
          */
        that.element = null;



     // /** The successor of the last child node that contributed to the leader, or null if either
     //   * no child contributed or the last to contribute has no successor.
     //   */
     // that.endChild = null;



        /** Answers whether the element has a leader of non-zero length.
          */
        that.hasLeader = false;



        /** Answers whether the leader is truncated.
          */
        that.isTruncated = false;



        /** The leader as read from the element in the form of a string, possibly truncated.  It will be
          * an empty string if either the element has no leader, or the leader was truncated to nothing.
          */
        that.leader = '';



        /** Reads the leader of the given element and sets the public properties of this reader to
          * reflect the results of the read.
          *
          *     @param maxLength (number) The length limit on the read.  A read that would exceed this
          *       limit will instead be truncated at the preceding word boundary.
          *     @param toIncludeRend (boolean) Whether to include any text contained within
          *       renderer-specific (NS_REND) elements.
          */
        that.read = function( element, maxLength=Number.MAX_VALUE, toIncludeRend=false )
        {
            let leader = '';
            let hasLeader = false;
         // let firstContributingChild = null;
         // let lastContributingChild = null;
            that.isTruncated = false;
            const dive = document.createTreeWalker( element );
              // Node.innerText and textContent would be too inefficient for this purpose, often diving
              // deeply into the element hierarchy where only a shallow dive is needed.
            let headroom = maxLength; // space remaining for the next word
         // let child = null; // tracking the last child that was encountered in the dive
            dive: for( ;; )
            {
                const d = dive.nextNode();
                if( !d ) break dive;

             // if( d.parentNode == element ) child = d;
                const dType = d.nodeType;
                if( dType == TEXT )
                {
                    const words = d.data.match( /\S+/g );
                    if( !words ) continue dive;

                    hasLeader = true;
                    for( const word of words )
                    {
                        const wN = word.length;
                        if( wN > headroom )
                        {
                            that.isTruncated = true;
                            break dive;
                        }

                        if( leader.length > 0 )
                        {
                            leader += ' '; // word separator
                            --headroom;
                        }
                        leader += word;
                        headroom -= wN;
                     // if( firstContributingChild == null ) firstContributingChild = child;
                     // lastContributingChild = child;
                    }
                }
                else if( dType == ELEMENT )
                {
                    const dNS = d.namespaceURI;
                    if( dNS.endsWith(NS_REND) && dNS.length == NS_REND.length ) // fast failing test
                    {
                        if( !toIncludeRend ) lastNode( dive ); // bypassing d and its content
                    }
                    else if( dNS.startsWith( NS_WAYSCRIPT_DOT )) break dive;
                    else
                    {
                        const styleDeclarations = window.getComputedStyle( d );
                        const displayStyle = styleDeclarations.getPropertyValue( 'display' );
                        if( displayStyle == 'inline' ) continue dive;

                        if( styleDeclarations.length == 0 ) // then something's wrong
                        {
                            // Work around it.  Apparent browser bug (Chrome 59).  "All longhand proper-
                            // ties that are supported CSS properties" must be reported, ∴ length should
                            // be > 0.  https://drafts.csswg.org/cssom/#dom-window-getcomputedstyle
                            if( dNS == NS_HTML && willDisplayInLine_likely(d) ) continue dive;
                        }

                        break dive;
                    }
                }
            }

            that.element = element;
            that.leader = leader;
            that.hasLeader = hasLeader;
         // that.startChild = firstContributingChild;
         // that.endChild = lastContributingChild == null? null: lastContributingChild.nextSibling;
        };



     // /** The first child node that contributed to the leader, or null if none did.
     //   */
     // that.startChild = null;



       // - - -

        return that;

    }() );



   // ==================================================================================================


    /** The parsed value of a waylink source node's *link* attribute.
      */
    class LinkAttribute
    {


        /** Constructs a LinkAttribute from its declared value.
          *
          *     @see #value
          *     @throw (string) Error message if the value cannot be parsed.
          */
        constructor( value )
        {
            this._value = value;
            let loc; // of document
            {
                const c = value.indexOf( '#' );
                if( c == -1 ) throw "Missing target node identifier '#': " + a2s('link',value);

                loc = value.slice( 0, c ); // without fragment
                this._targetID = value.slice( c + 1 );
            }
            if( loc.length > 0 )
            {
                if( loc.charAt(0) == '/'
                  && /*not a network-path reference*/(loc.length == 1 || loc.charAt(1) != '/') ) // [NPR]
                {
                    loc = CAST_BASE_PATH + loc; // waycast space → universal space
                }
                else if( !URIs.FULL_PATTERN.test( loc ))
                {
                    throw "Leading component must be either a URI scheme, or the waycast base '/': "
                      + a2s('link',value);
                }

                if( loc.endsWith('/') ) loc += 'way.xht';
            }
            this._targetDocumentLocation = loc;
        }



       // ----------------------------------------------------------------------------------------------


        /** The location of the targeted document as a URL string, or the empty string if the *link*
          * attribute encodes a *same-document reference*.
          *
          *     @see https://tools.ietf.org/html/rfc3986#section-4.4
          */
        get targetDocumentLocation() { return this._targetDocumentLocation; }



        /** The target identifier.
          */
        get targetID() { return this._targetID; }



        /** The unparsed string value of the attribute, as declared.
          */
        get value() { return this._stringValue; }



    }



   // ==================================================================================================


    /** The part of the rendering of a wayscript element that is generally open to being re-rendered.
      * This is a disposable, single-use class.
      */
    class PartRenderingC
    {


        /** Constructs a PartRenderingC.
          *
          *     @see #element
          */
        constructor( element )
        {

           // - i n p u t - / - c o n f i g u r a t i o n - - - - - - - - - - - - - - - - - - - - - - -

            /** The wayscript element whose tag to render.
              */
            this.element = element;


            /** Whether this element might actually be re-rendered.
              */
            this.isChangeable = false;


            /** The altered string to show for the local part of the element's qualified name,
              * or null to leave it unaltered.
              */
            this.localPartOverride = null;


           // - o u t p u t - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            /** The inserted start tag element, or null if *render* was not called.
              */
            this.eSTag = null;

        }



       // ----------------------------------------------------------------------------------------------


        /** Does the partial rendering of the element.  Specifically this method:
          * (a) reads this rendering's input/configuration properties and sets its output properties;
          * (b) reads the element's leader and leaves the results in the LeaderReader; and
          * (c) sets attributes on the element and inserts an *eSTag* child to render its start tag.
          * Call once only.
          */
        render()
        {
            const e = this.element;
  /*[C2]*/  if( this.isChangeable ) e.setAttributeNS( NS_REND, 'isChangeable', 'isChangeable' );

          // Leader
          // ------
            const toIncludeRend = true;
              // else the leader would exclude *forelinker* content in the case of a waylink source node
            console.assert( e.firstChild == null || e.firstChild.nodeName != 'eSTag', A );
              // else the leader would include the start tag
            LeaderReader.read( e, /*maxLength*/0, toIncludeRend );
  /*[C2]*/  if( LeaderReader.hasLeader ) e.setAttributeNS( NS_REND, 'hasLeader', 'hasLeader' );

          // Start tag
          // ---------
            console.assert( this.eSTag == null, AA + 'Method *render* is called once only' );
            const eSTag = this.eSTag = document.createElementNS( NS_REND, 'eSTag' );
  /*[C2]*/  e.insertBefore( eSTag, e.firstChild );
            const eQName = eSTag.appendChild( document.createElementNS( NS_REND, 'eQName' ));

          // prefix part of name
          // - - - - - - - - - -
            const prefix = e.prefix;
            let isPrefixAnonymousOrAbsent;
            if( prefix )
            {
                const ePrefix = eQName.appendChild( document.createElementNS( NS_REND, 'ePrefix' ));
                ePrefix.appendChild( document.createTextNode( prefix ));
                if( prefix == ELEMENT_NAME_NONE )
                {
                    isPrefixAnonymousOrAbsent = true;
                    ePrefix.setAttributeNS( NS_REND, 'isAnonymous', 'isAnonymous' );
                }
                else isPrefixAnonymousOrAbsent = false;
            }
            else isPrefixAnonymousOrAbsent = true;

          // local part of name
          // - - - - - - - - - -
            const eLocalPart = eQName.appendChild( document.createElementNS( NS_REND, 'eLocalPart' ));
            let lp = this.localPartOverride? this.localPartOverride: e.localName;
            const isAnonymous = lp == ELEMENT_NAME_NONE;
            if( isAnonymous )
            {
                lp = '●'; // alternatives • ● ■
                eQName.setAttributeNS( NS_REND, 'isAnonymous', 'isAnonymous' );
            }
            else if( lp.charAt(0) != '_' ) lp = lp.replace( /_/g, ' ' ); /* If it starts with a non-
              underscore, which hopefully means it has some letters or other visible content,
              then replace any underscores with nonbreaking spaces for sake of readability. */
            eLocalPart.appendChild( document.createTextNode( lp ));

          // rendering of name
          // - - - - - - - - -
            const eNS = e.namespaceURI;
            let renderedName, maxShort;
            if( eNS == NS_STEP )
            {
                renderedName = isAnonymous && !isPrefixAnonymousOrAbsent? prefix: lp;
                maxShort = 1; // less to allow room for extra padding that readable.css adds
            }
            else
            {
                renderedName = lp;
                maxShort = 2;
            }
  /*[C2]*/  if( renderedName.length <= maxShort ) e.setAttributeNS( NS_REND, 'hasShortName', 'hasShortName' );
        }


    }



   // ==================================================================================================


    /** PartRenderingC for an element that is already rendered and needs re-rendering.
      */
    class PartRenderingC2 extends PartRenderingC
    {

        /** Constructs a PartRenderingC2, first removing the markup of the previous rendering.
          *
          *     @see PartRenderingC#element
          */
        constructor( element )
        {
            super( element );
            const eSTag = element.firstChild;
            if( eSTag.localName != 'eSTag' ) throw 'Missing eSTag';

            element.removeChild( eSTag );

            // remove any attributes that might have been set:
            element.removeAttributeNS( NS_REND, 'hasLeader' );
            element.removeAttributeNS( NS_REND, 'hasShortName' );
            element.removeAttributeNS( NS_REND, 'isChangeable' );
        }

    }



   // ==================================================================================================


    /** Runtime enforcer of style rules and settings for the overall document.
      * It appends style rules to the document and sets style attributes.
      */
    const Styler = ( function()
    {

        const that = {}; // the public interface of Styler



       // - P u b l i c --------------------------------------------------------------------------------


        /** Runs this styler.
          */
        that.run = function()
        {
            const body = document.body;

          // Attributes
          // ----------
            let luminosity; // perceived background brightness
            let toOverrideColour; // whether to override the client's default colours
            let defaultColour = window.getComputedStyle(body).getPropertyValue( 'color' );
              // Want 'background-color' but it fails.  Reads as transparent on Firefox and black
              // on Chrome when really it's white.  Therefore using foreground to infer background.
            const cc = defaultColour.match( /^\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/ );
            if( cc )
            {
                const red = cc[1], green = cc[2], blue = cc[3]; // each 0-255
                const luma = red * 299 + green * 587 + blue * 114; // 0-255,000
                  // formula: https://en.wikipedia.org/wiki/YIQ
                if( luma < 127500 )
                {
                    // Here using luma as a quick measure of perceived brightness.
                    // For more accuracy: https://www.w3.org/TR/WCAG20/#relativeluminancedef
                    luminosity = 'bright';
                    toOverrideColour = defaultColour == 'rgb(0, 0, 0)'
                        && navigator.userAgent.includes('Chrome'); /* Override if client appears to be
                      Chrome with its default colours (pure black and white) unchanged, because Chrome
                      itself gives the user no easy way to change these unsatisfactory defaults
                      and therefore this renderer will venture a change itself. */
                 // defaultColour = 'hsl( 0, 0%, 93% )'; luminosity = 'dark'; // TEST
                }
                else
                {
                    toOverrideColour = false;
                    luminosity = 'dark';
                }
            }
            else // parse failed, default colour is unknown
            {
                toOverrideColour = true;
                luminosity = 'bright';
                defaultColour = 'hsl( 0, 0%, 7% )'; // near black, leaving room to blacken further
            }
            body.setAttributeNS( NS_REND, 'luminosity', luminosity );

          // Rules
          // -----
            let e = body.appendChild( document.createElementNS( NS_HTML, 'style' ));
            const sheet = e.sheet;
            const rules = sheet.cssRules;
            function insert( rule ) { sheet.insertRule( rule, rules.length ); }
            insert( '@namespace cog "' + NS_COG + '"' );
            insert( '@namespace rend "' + NS_REND + '"' );
            if( toOverrideColour ) insert( '@namespace html "' + NS_HTML + '"' );

          // Colour override
          // - - - - - - - -
            let defaultHyperlinkColour;
            if( toOverrideColour )
            {
                insert( 'html|body { '
                  + 'background-color: hsl( 0, 0%, 93% );' // near white, leaving room to whiten further
               // + 'background-color: hsl( 0, 0%, 7% );' // TEST
                  + 'color:' + defaultColour + '}' );
                defaultHyperlinkColour = 'hsl( 240, 100%, 40% )'; // blue
                insert( 'html|a:link { color:' + defaultHyperlinkColour + '}' );
                insert( 'html|a:visited { color: hsl( 0, 100%, 40% ) }' ); // red
            }
            else
            {
                e = body.appendChild( document.createElementNS( NS_HTML, 'a' ));
                e.setAttribute( 'href', '#dummyURL' ); // to be sure
                e.appendChild( document.createTextNode( 'dummy hyperlink' )); // to be sure
                defaultHyperlinkColour = window.getComputedStyle(e).getPropertyValue( 'color' );
                body.removeChild( e );
            }

          // Fade
          // - - -
            insert( '@keyframes flashFade_outline{'
              + 'from { outline: medium solid ' + defaultColour + '; animation-timing-function: linear }'
              + ' 33% { outline: medium solid ' + defaultColour + '; animation-timing-function: ease-out }'
              + '  to { outline: medium solid transparent }}' );

          // Waylink source node
          // - - - - - - - - - -
            insert( 'rend|forelinker > a > preview { color:' + defaultColour + '}' );
            insert( 'rend|forelinker > a > verticalTruncator { color:' + defaultColour + '}' );
            insert( '[cog|link$="/actor/#commitment"] > eSTag > eQName > eLocalPart { '
              + 'color:' + defaultHyperlinkColour + ';'
           // + 'filter: hue-rotate( 180deg ) !important }' );
           /// somehow Chrome 59 seems to render that as black, but this works well enough:
           // + 'filter: hue-rotate( 60deg ) !important }' );
           //      // Rotate to distinguish from hyperlinks.  This must be declared as 'important';
           //      // maybe because otherwise the colour setting gets applied late and clobbers it.
           /// blind hue rotation is reckless, fall back to font-weight as the sole distinguisher
              + '}' );

          // Waylink target node
          // - - - - - - - - - -
            insert( 'rend|eSTag > a > eQName { outline-color:' + defaultColour + '}' );
              // Cannot rely on outline-color's initial value of 'invert' because that keyword is rejected
              // in the keyframes of flashFade_outline (at least by Firefox 52).  Nor is 'currentColor'
              // useful, because if this element happens to be a step, and so has inverted colours,
              // then currentColor will be the opposite of what's needed for the outline.
        };



       // - - -

        return that;

    }() );



   // ==================================================================================================


    /** Dealing with waylink target nodes.
      */
    const Targets = ( function()
    {

        const that = {}; // the public interface of Targets



        function formAsTargeted( eSTag ) // companion to "target:" rules in readable.css
        {
            const a = eSTag.firstChild;
            a.removeAttribute( 'href' );
        }



        function formAsUntargeted( eSTag, target )
        {
            const a = eSTag.firstChild;
            a.setAttribute( 'href', '#' + target.getAttributeNS(NS_COG,'lid') );
        }



        /** Returns the fragment part of window.location without a preceding hash '#' symbol,
          * or null if the fragment part is missing.
          *
          *     @see #targetedID
          */
        function readTargetedID()
        {
            const hash = window.location.hash; // [WDL]
            return hash.length == 0? null: hash.slice(1);
        }



        /** The target node that is formed as targeted, or null if there is none.
          */
        let targetedFormed = null;



        /** The latest value of the targeted identifier, cached for reuse.
          *
          *     @see #readTargetedID
          */
        let targetedID = readTargetedID();



       // - P u b l i c --------------------------------------------------------------------------------


        /** Initializes a target node.
          *
          *     @param lidV (string) The identifier declared by the target node.
          */
        that.initTarget = function( eSTag, target, lidV )
        {
            if( lidV == targetedID )
            {
                console.assert( targetedFormed === null, A );
                targetedFormed = target;
             // formAsTargeted( eSTag );
             /// redundant, it happens to start in that form
            }
            else formAsUntargeted( eSTag, target );
        };



       // - - -

        window.addEventListener( 'hashchange', function()
        {
            targetedID = readTargetedID();
            let target = targetedFormed;
            if( target )
            {
                targetedFormed = null;
                formAsUntargeted( /*eSTag*/target.firstChild, target );
            }
            target = getTargetById( targetedID );
            if( target )
            {
                targetedFormed = target;
                formAsTargeted( /*eSTag*/target.firstChild );
            }
        });

        return that;

    }() );



   // ==================================================================================================


    /** A device for tracing the way across multiple, way-linked documents.
      */
    const WayTracer = ( function()
    {

        const that = {}; // the public interface of WayTracer



        /** Answers whether the specified leg is already traced.
          *
          *     @see #newLegID
          *     @see #shutLeg
          */
        function isShut( legID ) { return legsShut.includes(legID); }
          // the likely efficiency of this test is asserted by INC FAST, q.v.



        /** Array of leg identifiers (string), one for each leg of the trace in progress.
          */
        const legsOpen = [];



        /** Array of leg identifiers (string), one for each leg that is done tracing.
          */
        const legsShut = [];



        /** Constructs a trace leg identifier (string) for the given target.
          *
          *     @param targetDocLoc (string) The target document location in normal URL form.
          *     @param targetID (string)
          */
        function newLegID( targetDocLoc, targetID )
        {
            if( targetDocLoc == ROOT_DOCUMENT_LOCATION ) return ROOT_LEG_ID;
              // All targets of the root document are here assigned the same identifier.  This can be
              // understood either (a) logically as a consequence of the exception of tracing the root
              // document as a whole in a single leg, all of a piece; or (b) practically as a method of
              // helping the code to isolate the root targets for special treatment (basically to ignore
              // them) and so to shield itself from the consequences of this exception.

            return targetDocLoc + '#' + targetID;
        }



        /** Adds the given leg identifier to legsOpen.
          *
          *     @see #newLegID
          *     @see #wasOpened
          */
        function openLeg( legID )
        {
            legsOpen.push( legID );
         // console.debug( legsOpen.length + '\t\tleg ' + legID ); // TEST
              // spacing matters here, cf. shutLeg
        }



        /** The normal-form location (URL string) of the trace root document, which is the visionary
          * document.  The visionary document as a whole formalizes the endmost goal, which grounds
          * the way.  Therefore the whole of it is taken as the root leg of the way trace.
          *
          *     @see URIs#normalize
          */
        const ROOT_DOCUMENT_LOCATION = CAST_BASE_LOCATION + 'visionary/way.xht';



        /** The identifier of the root leg of the trace, which comprises the root document.
          * All other legs are identified by target URL.
          */
        const ROOT_LEG_ID = 'ROOT';



        /** Moves the given leg identifier from legsOpen to legsShut,
          * then starts decorating if all legs are now shut.
          *
          *     @throw (string) Error message if legID is missing from legsOpen.
          *
          *     @see #newLegID
          *     @see #isShut
          */
        function shutLeg( legID )
        {
            const o = legsOpen.indexOf( legID );
            if( o < 0 ) throw "Leg is not open: " + legID;

          // Shut the leg
          // ------------
            legsOpen.splice( o, /*removal count*/1 );
         // console.debug( '\t' + legsOpen.length + '\tleg ' + legID + ' ·' ); // TEST
              // spacing matters here, cf. openLeg
            legsShut.push( legID );
            if( legsOpen.length > 0 ) return;

          // After all are shut
          // ------------------
            console.assert( legsShut.length < 200, AA + 'INC FAST, q.v.' );
              // asserting the likely efficiency of the tests legsOpen and legsShut.includes
         // console.debug( 'Way trace complete' ); // TEST
        }



        /** Ensures that the specified leg is fully traced before returning.  May return with any number
          * of waylinks yet untraced, slated for later tracing as separate legs.
          *
          *     @see #newLegID
          *     @param branch (Element) Base element of the branch that comprises the leg.
          *     @param docReg (DocumentRegistration)
          *     @param isEmbodied (boolean) Whether the branch lies leafward of the HTML body.
          */
        function traceLeg( legID, branch, docReg, isEmbodied = true )
        {
            const doc = branch.ownerDocument;
        //  if( doc == document ) console.debug( '\t\t\t(in present document)' ); // TEST
            const docLoc = docReg.location;

          // Guard the entrance with a rootward scan
          // ---------------------------------------
            if( isEmbodied ) for( let r = branch;; )
            {
                r = r.parentNode;
                const ns = r.namespaceURI;
                if( ns == null ) // then r is the document node
                {
                    mal( 'Malformed document: Missing HTML *body* element: ' + docLoc );
                    break;
                }

                if( isBitNS( ns ))
                {
                    const lidV = r.getAttributeNS( NS_COG, 'lid' );
                    if( !lidV ) continue;

                    if( isShut( newLegID( docLoc, lidV ))) return; /* If only for sake of efficiency,
                      since the whole branch was already traced as part of a larger branch. */
                }
                else if( r.localName == 'body' && ns == NS_HTML ) break;
            }

          // Enter the branch
          // ----------------
            const traversal = doc.createTreeWalker( branch, SHOW_ELEMENT );
            for( ;; )
            {
                const t = traversal.nextNode();
                if( t == null ) break;

              // Source node
              // -----------
                source:
                {
                    const linkV = t.getAttributeNS( NS_COG, 'link' );
                    if( !linkV ) break source;

                    let link;
                    try { link = new LinkAttribute( linkV ); }
                    catch( unparseable ) { break source; }

                    // No need here to guard against other types of malformed declation, which are
                    // guarded elsewhere.  Rather let the trace extend as the wayscribe intended.
                    let targetDocLoc = link.targetDocumentLocation;
                    if( !targetDocLoc ) targetDocLoc = docLoc;

                    targetDocLoc = URIs.normalize( targetDocLoc );
                    const targetID = link.targetID;
                    const targetLegID = newLegID( targetDocLoc, targetID );
                    if( wasOpened( targetLegID )) break source;

                    openLeg( targetLegID );
                    Documents.readNowOrLater( targetDocLoc, new class extends DocumentReader
                    {
                        close( docReg )
                        {
                            if( docReg.document == null ) shutLeg( targetLegID );
                            // else readDirectly has (or will) shut it
                        }

                        read( docReg, targetDoc ) /* The call to this method might come now or later,
                          but the method itself ensures that any actual reading is done only later,
                          after the present leg is fully traced and marked shut.  Thus it enables
                          optimizations elsewhere in the code that depend on such ordering. */
                        {
                            this.wasDocRetrieved = true;
                            const wasCalledLate = isShut( legID );
                            const readMethod = wasCalledLate? this.readDirectly: this.readLater;
                            readMethod.call( this, docReg, targetDoc );
                        }

                        readDirectly( docReg, targetDoc )
                        {
                            const target = Documents.getTargetById( targetDoc, targetID );
                              // assumes AFTER_TARGETS_IDD, q.v.
                            if( target ) traceLeg( targetLegID, target, docReg );
                            else console.warn( 'Broken waylink truncates trace at leg: ' + targetLegID );
                            shutLeg( targetLegID );
                        }

                        readLater( docReg, targetDoc )
                        {
                         // setTimeout( this.readDirectly, /*delay*/0, docReg, targetDoc );
                         /// but more efficiently (as a microtask) and properly bound as a method call:
                            Promise.resolve().then( function()
                            {
                                this.readDirectly( docReg, targetDoc );
                            }.bind( this ));

                            // This merely postpones execution till (I think) the end of the current
                            // event loop.  A more elegant and useful solution might be to specifically
                            // await the shut state of the present leg.  Maybe that could be done using
                            // the new Promise/async facility?
                        }
                    });
                }

              // Target node
              // -----------
                const lidV = t.getAttributeNS( NS_COG, 'lid' );
                if( lidV && isShut(newLegID(docLoc,lidV)) ) lastNode( traversal ); /* Bypass sub-branch
                  t, if only for efficiency's sake, as already it was traced in a separate leg. */
            }
        }



        /** Answers whether the specified leg was ever opened.
          *
          *     @see #newLegID
          *     @see #openLeg
          */
        function wasOpened( legID ) { return legsOpen.includes(legID) || legsShut.includes(legID); }
          // the likely efficiency of these tests is asserted by INC FAST, q.v.



       // - P u b l i c --------------------------------------------------------------------------------


        /** Starts this tracer.  It assumes AFTER_TARGETS_IDD, q.v. in the source code.
          */
        that.start = function()
        {
            const id = ROOT_LEG_ID;
            console.assert( !wasOpened(id), A );
            openLeg( id );
            Documents.readNowOrLater( ROOT_DOCUMENT_LOCATION, new class extends DocumentReader
            {
                close( docReg ) { shutLeg( id ); }
                read( docReg, doc ) { traceLeg( id, doc.documentElement, docReg, /*isEmbodied*/false ); }
            });
        };



       // - - -

        return that;

    }() );



////////////////////

    run();

}() );


// Notes
// -----
//  [C2] The constructor of PartRenderingC2 must remove all such markup.
//
//  [EP]  This rendering places entagments before the first waybit child.
//        Code that depends on this refers here.
//
//  [EWR]  ExternalWaylinkResolver might run marginally faster if (instead) it began the traversal
//         with the source nodes and sought the target of each using (the new) Documents.getTargetById.
//
//  [F]  External documents won’t reliably load when rendering a wayscript file on a file-scheme URL.
//       See support file _wayic.read_local_access.xht.
//
//  [NPR]  URI network-path reference, https://tools.ietf.org/html/rfc3986#section-4.2
//
//  [WDL]  Either 'document.location' or 'window.location', they are identical.
//         https://www.w3.org/TR/html5/browsers.html#the-location-interface
