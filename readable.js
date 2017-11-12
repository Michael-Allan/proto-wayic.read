/** readable - A minimal, conservative rendering for mere readability
  *
  * See readable.css for an introduction.  This script begins executing at function *run*.
  */
'use strict';
( function()
{

    /// preliminary declarations out of lexical order ///


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



   // --------------------------------------------------------------------------------------------------


    /** The default message for console assertions.
      */
    const A = 'Assertion failure';



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
        if( isBit && sourceLocalPart == ELEMENT_NAME_INHERIT ) rendering.localPartOverride = targetLocalPart;
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
            if( targetPreviewString.length <= 2 )
            {
                forelinker.className = 'shortContent';
            }
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



    /** The string that means *inherit from target* when it encodes the local part of the name
      * of a waylink souce node.
      */
    const ELEMENT_NAME_INHERIT = '_ι';



    /** The string that means *none* when it encodes the local part of a wayscript element's name.
      */
    const ELEMENT_NAME_NONE = '_';



    /** Returns the first child of the given node that is a waybit.
      */
    function firstWaybitChild( node )
    {
        const traversal = document.createTreeWalker( node, SHOW_ELEMENT );
        let t = traversal.nextNode();
        for(; t != null; t = traversal.nextSibling() ) if( isWaybit( t )) return t;
        return null;
    }



    /** Tries to find a target node by the *id* attribute which this script sets on it.
      * Returns the target node for the given *id*, or null if this script has yet to set it.
      */
    function getTargetById( id )
    {
        let e = document.getElementById( id );
        if( e )
        {
            const lidV = e.getAttributeNS( NS_COG, 'lid' );
            if( lidV == id ) return e;
        }

        return null;
    }



    /** Answers whether ns is a namespace of waybits.  That means either NS_BIT itself
      * or another namespace that starts with NS_BIT and a dot separator.
      * The only other defined at present is NS_STEP.
      *
      *     @param ns (string)
      */
    function isABitNS( ns )
    {
        const nsBitLen = NS_BIT.length;
        return ns.startsWith(NS_BIT) && (ns.length == nsBitLen || ns.charAt(nsBitLen) == '.');
    }



    /** Answers whether subNS is a subnamespace of waybits.  That means either 'bit' itself
      * or another subnamespace that starts with "bit.".
      *
      *     @param subNS (string) A wayscript namespace without the leading NS_WAYSCRIPT_DOT.
      */
    function isABitSubNS( subNS )
    {
        return subNS.startsWith(SUB_NS_BIT) && (subNS.length == 3 || subNS.charAt(3) == '.');
    }



    /** Whether the user reading the document might also write to it.
      */
    const isUserScribe = document.URL.startsWith( 'file:' );



    /** Answers whether the given element is a waybit.
      */
    function isWaybit( e )
    {
        // cf. transform() isWaybit
        const eNS = e.namespaceURI;
        if( !eNS.startsWith(NS_WAYSCRIPT_DOT) ) return false;

        const eSubNS = eNS.slice( NS_WAYSCRIPT_DOT_LENGTH );
        if( isABitSubNS( eSubNS )) return true;

        return false;
    }



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
     // console.assert( message, AA + 'Mal message is not empty' );
        console.error( message );
        if( isUserScribe ) alert( message ); // see readable.css § Debugging
    }



    /** Puts the given location through the client's hyperlink URL parser, resolving any relative path
      * to an absolute path, and otherwise normalizing its form.  Returns the result.
      */
    function normalizeURL( loc )
    {
        // modified from Matt Mastracci, https://grack.com/blog/2009/11/17/absolutizing-url-in-javascript/
        const p = normalizeURL.parserElement;
        p.firstChild.href = loc; // escaping the URL en passant
        p.innerHTML = p.innerHTML; // reparsing it
        return p.firstChild.href;
    }

        {
            normalizeURL.parserElement = document.createElement( 'div' );
            normalizeURL.parserElement.innerHTML = '<a/>';
        }



    /** The XML namespace of waybits simply, excluding subspaced waybits such as steps.
      */
    const NS_BIT  = NS_WAYSCRIPT_DOT + SUB_NS_BIT;



    /** The XML namespace of markup specific to cogs.
      */
    const NS_COG  = NS_WAYSCRIPT_DOT + SUB_NS_COG;



    /** The XML namespace of HTML.
      */
    const NS_HTML = 'http://www.w3.org/1999/xhtml';



    /** The XML namespace of markup specific to this renderer.
      */
    const NS_REND = 'data:,wayic/read';



    /** The XML namespace of steps.
      */
    const NS_STEP = NS_WAYSCRIPT_DOT + SUB_NS_STEP;



    /** Reads the previewable text content of the given target node, and sets the style class
      * of the given preview element if the previewable text is truncated.
      *
      *     @param target (Element) The waylink target node.
      *     @param preview (Element) The *preview* element that will contain the returned text.
      *       It must have no style class set on it.
      *
      *     @return (string) The previewable text content for setting in the *preview* element,
      *       or an empty string if there is none.
      */
    function readTargetPreview( target, preview )
    {
     // LeaderReader.read( target, TARGET_PREVIEW_MAX_LENGTH );
     // console.assert( !preview.className, A ); // style class never needs resetting, only setting
     // if( LeaderReader.isTruncated ) preview.className = 'truncated';
     //// truncation seems to serve no necessary purpose, and is sometimes unwanted, so try defeating it
        LeaderReader.read( target );
        return LeaderReader.leader;
    }



    /** The location of the waycast in normalized URL form, with a trailing slash '/'.
      */
    let CAST_BASE_LOC; // init below, thence constant



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
                if( document.URL.includes( '/_base_' )) path = '.';
                  // Almost certainly it's a hard link to (or copy of) the wayscript file placed
                  // by the user in the waycast base for debugging purposes, as per readable.css.
                  // We could have detected it earlier, avoiding the cost of the form checks above,
                  // but normal code should run as far as possible when debugging, as a rule.
                return path;
            }
        }

        mal( "Missing 'cast' element in document 'head'" );
        return path;
    }() );


        {
            let loc = normalizeURL( CAST_BASE_PATH );
            console.assert( !loc.includes('..'), A );
            if( !loc.endsWith('/') ) loc = loc + '/';
            CAST_BASE_LOC = loc;
        }



    /** Runs this script.
      */
    function run()
    {
        console.assert( (eval('var _tmp = null'), typeof _tmp === 'undefined'), AA + 'Strict mode' );
          // http://www.ecma-international.org/ecma-262/6.0/#sec-strict-mode-code
          // credit Noseratio, https://stackoverflow.com/a/18916788/2402790
        Styling.run();
        transform();
      // --------------------
      // Layout is now stable
      // --------------------
        document.body.style.display = 'block'; // overriding readable.css in order to lay out and show the page
        ExternalWaylinkResolver.start();
        WayTracer.start();
    }



    /** The maximum number of characters in a forelinker target preview.
      */
    const TARGET_PREVIEW_MAX_LENGTH = 36;



    const TEXT = Node.TEXT_NODE;



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
            if( !t ) break;

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
                isBit = isABitSubNS( tSubNS );
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
            function waylinkAttribute( attrName ) // returns its value, or null
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
            const lidV = waylinkAttribute( 'lid' ); // target identifier, non-null if t is a target node
            const linkV = waylinkAttribute( 'link' ); // waylink declaration, non-null if t is a source node

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
                if( !isDeclaredEmpty ) // tagless declaration of source node
                {
                  // Translate tagless declaration → entagment
                  // -----------------------------------------
                    const entagment = document.createElementNS( NS_BIT, ELEMENT_NAME_INHERIT );
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

                let targetDocLoc, targetID;
                {
                    const c = linkV.indexOf( '#' );
                    if( c == -1 )
                    {
                        mal( "Link declaration without target identifier '#': " + a2s('link',linkV) );
                        break source;
                    }

                    targetDocLoc = linkV.slice( 0, c ); // without fragment
                    targetID = linkV.slice( c + 1 );
                }
                const preview = document.createElementNS( NS_REND, 'preview' );
                let targetPreviewString, targetDirectionChar;
                if( targetDocLoc.length > 0 )
                {
                    if( targetDocLoc.startsWith( '/' )) targetDocLoc = CAST_BASE_PATH + targetDocLoc;
                      // translating waycast space → universal space
                    else if( targetDocLoc.includes( ':' ))
                    {
                        mal( "Target URL appears not to be relative to the waycast: " + a2s('link',linkV) );
                    }
                    else if( isUserScribe // so sparing others the cost of this slow test
                      && !normalizeURL(targetDocLoc).startsWith(CAST_BASE_LOC) )
                    {
                        mal( "Target is outside of the waycast: " + a2s('link',linkV) );
                    }
                    if( targetDocLoc.endsWith('/') ) targetDocLoc += 'way.xht';
                    ExternalWaylinkResolver.registerLink( t, targetDocLoc ); /* Either the target
                      is outside of this document, or it's bizarrely specified.  No matter. */
                    targetDirectionChar = '→'; /* [ → ⮕ ▸ ] */
                    rendering.isChangeable = true;
                    targetPreviewString = '⮎';
                }
                else // the target is within this document
                {
                    let target = getTargetById( targetID );
                    if( target ) targetDirectionChar = '↑'; /* [ ↑ ⮭ ▴ ] */
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
                                break source;
                            }

                            if( u.getAttributeNS(NS_COG,'lid') == targetID )
                            {
                                target = u;
                                targetDirectionChar = '↓'; /* [ ↓ ⮯ ▾ ] */
                                break;
                            }
                        }
                    }

                    configureForTarget( tNS, tLocalPart, linkV, isBit, target, rendering );
                    targetPreviewString = readTargetPreview( target, preview );
                }
                const forelinker = t.appendChild( document.createElementNS( NS_REND, 'forelinker' ));
                const a = forelinker.appendChild( document.createElementNS( NS_HTML, 'a' ));
                a.setAttribute( 'href', targetDocLoc + '#' + targetID );
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
                const idV = t.getAttribute( 'id' );
                if( idV )
                {
                    if( lidV == idV ) t.removeAttribute( 'id' ); // pending the getElementById check below
                    else mal( 'Element with ' + a2s('id',idV) + ' has non-matching ' + a2s('lid',lidV) );
                }
                const e = document.getElementById( lidV );
                if( e ) mal( "Identifier already assigned to another element: " + a2s('lid',lidV) );
                else t.setAttribute( 'id', lidV );

              // Self hyperlink
              // --------------
                const a = document.createElementNS( NS_HTML, 'a' );
                const eQName = eSTag.firstChild;
                eSTag.insertBefore( a, eQName );
                a.appendChild( document.createElementNS( NS_REND, 'targetMarker' ))
                 .appendChild( document.createTextNode( '→' )); // alternatives → ⇉
                a.appendChild( eQName ); // wrap it

              // ---
                WaylinkSE.initTarget( eSTag, t, lidV );
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



   // ==================================================================================================


    /** Documents external to this one.
      */
    const Documents = ( function()
    {

        const that = {}; // the public interface of Documents



        /** Map of summons and summoned documents.  Each entry is keyed by the URL string
          * of the summoned document.  It holds either the document itself or the array
          * of summoning readers that await it.
          */
        const summonsRegistry = new Map();



       // - P u b l i c --------------------------------------------------------------------------------


        /** @param fromLocation (string) The document location in URL form.
          * @param read (Function) A one-parameter consumer to take the summoned document either now,
          *   later or never as the case may be.
          */
        that.summonDocument = function( fromLocation, read )
        {
            let entry = summonsRegistry.get( fromLocation );
            let readFunctions;
            if( entry === undefined )
            {
                entry = readFunctions = [];
                summonsRegistry.set( fromLocation, entry );
                const req = new XMLHttpRequest();
             // req.overrideMimeType( 'application/xhtml+xml' );
             /// still it parses to an XMLDocument (Firefox 52), unlike this document
                req.open( 'GET', fromLocation, /*asynchronous*/true );
                req.responseType = 'document';
             // req.addEventListener( 'onload', function( e )
             /// then somehow Firefox (52) rejects even the in-branch local requests [F], so instead:
                req.onload = function( e )
                {
                    const externalDoc = e.target.response;
                    summonsRegistry.set( fromLocation, externalDoc );
                    for( const read of readFunctions ) read( externalDoc );
                };
                req.send();
            }
            else if( entry instanceof Document )
            {
                read( entry );
                return;
            }

            else
            {
                console.assert( entry instanceof Array, A );
                readFunctions = entry;
            }
            readFunctions.push( read );
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



        /** Map of source arrays, each source array keyed by the URL string of a document,
          * which is the common document that its source elements all target.
          */
        const sourceRegistry = new Map();



       // - P u b l i c --------------------------------------------------------------------------------


        /** Tells this resolver of an external link to be resolved.
          *
          *     @param node (Element) A source node that has an external target.
          */
        that.registerLink = function( sourceNode, targetDocLoc )
        {
            let sourceNodes = sourceRegistry.get( targetDocLoc );
            if( sourceNodes === undefined )
            {
                sourceNodes = [];
                sourceRegistry.set( targetDocLoc, sourceNodes );
            }
            sourceNodes.push( sourceNode );
        };



        /** Starts resolving the registered links.  Runs to completion.
          */
        that.start = function()
        {
            if( sourceRegistry.size == 0 ) return;

            const NS_WAYSCRIPTISH = NS_WAYSCRIPT_DOT.slice( 0, 2 ); // enough for a quick, cheap test
            for( const entry of sourceRegistry )
            {
                const targetDocLoc = entry[0];
                const sourceNodes = entry[1];
                Documents.summonDocument( targetDocLoc, /*read*/function( targetDoc )
                {
                    const traversal = targetDoc.createNodeIterator( targetDoc, SHOW_ELEMENT );
                    tt: for( ;; ) // seek the target nodes in *that* document
                    {
                        const target = traversal.nextNode();
                        if( !target ) break tt;

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
                            configureForTarget( sourceNS, source.localName, linkV, isABitNS(sourceNS), target,
                              reRendering );
                            reRendering.render();
                            const forelinker = source.lastChild;
                            const preview = forelinker.firstChild/*a*/.firstChild;
                            const previewText = preview.firstChild;
                            const newPreviewString = readTargetPreview( target, preview );
                            previewText.replaceData( 0, previewText.length, newPreviewString );
                            configureForTargetPreview( source, forelinker, newPreviewString );

                          // De-register it
                          // --------------
                            sourceNodes.splice( s, /*deletion count*/1 );
                            if( sourceNodes.length == 0 ) break tt; // done with this targetDoc

                        } while( --s >= 0 )
                    }
                    for( const source of sourceNodes ) // for any that remain unmatched:
                    {
                        const linkV = source.getAttributeNS( NS_COG, 'link' );
                        mal( "Broken link: No matching 'lid' in that document: " + a2s('link',linkV) );
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
                        const display = window.getComputedStyle( d ).getPropertyValue( 'display' );
                        if( display != 'inline' ) break dive;
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


    /** The part of the rendering of a wayscript element that is generally open to being re-rendered.
      * This is a disposable, single-use class.
      */
    class PartRenderingC
    {


        /** Constructs an PartRenderingC.
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


    /** Runtime style rules and settings for the overall document.
      */
    const Styling = ( function()
    {

        const that = {}; // the public interface of Styling



       // - P u b l i c --------------------------------------------------------------------------------


        /** Appends style rules to the document and sets style attributes.
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
              // Cannot rely on the initial value of 'invert' here because that keyword is rejected
              // in the keyframes of flashFade_outline (at least by Firefox 52).  Nor is 'currentColor'
              // useful, because if this element happens to be a step, and so has inverted colours,
              // then currentColor will be the opposite of what's needed for the outline.
        };



       // - - -

        return that;

    }() );



   // ==================================================================================================


    /** Styling and event handling for waylink target nodes.
      */
    const WaylinkSE = ( function()
    {

        const that = {}; // the public interface of WaylinkSE



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
            const hash = window.location.hash; // 'window' https://stackoverflow.com/a/2431375/2402790
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


    /** A device to decorate the rendered wayscript with information from a complete way trace.
      * It traces and it decorates.
      */
    const WayTracer = ( function()
    {

        const that = {}; // the public interface of WayTracer



       // - P u b l i c --------------------------------------------------------------------------------


        /** Starts this tracer, which runs to completion.
          */
        that.start = function()
        {
            // TODO
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
//  [EP] This rendering places entagments before the first waybit child.
//       Code that depends on this refers here.
//
//  [F]  External documents won’t reliably load when rendering a wayscript file on a file-scheme URL.
//      For the details, see readable.css § Debugging.
