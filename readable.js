/** readable - Wayscript that’s readable on the web
  *
  *   See readable.css for a general introduction.  The sections below are for programmers.
  *
  *
  * ENTRY
  * -----
  *   This program starts itself at function *run*, declared below.  It provides no exports
  *   but does extend the DOM (see § further below).
  *
  *
  * SPECIAL MARKUP
  * --------------
  *   The renderer introduces its own markup to the document which includes the following:
  *   (for the notation, see the key further below)
  *
  *   Any element
  *   - - - - - -
  *      * [rend:isOnWayBranch] - Whether this element is (with all of its descendants) on way
  *
  *   html:html
  *   - - - - -
  *      * [rend:lighting]  - Either ‘paper’ for black on white effects, or ‘neon’ for the reverse
  *
  *   html:body
  *   - - - - -
  *      * scene        - Document scene
  *          * [id]     - '_wayic.read.document_scene'
  *      * scene(s)     - Interlink scenes
  *          * [class]  - 'interlink'
  *      * offWayScreen - Overlay screen for off-way styling, q.v. in readable.css.
  *
  *   Wayscript element
  *   - - - - - - - - -
  *      * [rend:hasLeader]         - Whether the element has leading, non-whitespace text [BA]
  *      * [rend:hasPreviewString]  - Whether it’s a waylink source node with a non-empty preview
  *                                   of the target text
  *      * [rend:hasShortName]  - Whether its rendered name is no longer than three characters
  *      * [rend:isBroken]      - Whether it’s a waylink source node with a broken target reference
  *      * [rend:isChangeable]  - Whether its rendering might later be changed
  *      * [rend:isComposer]    - Whether it’s a composer element
  *      * [rend:isEntagment]   - Whether it’s a waylink entagment
  *      * [rend:isOrphan]      - Whether it’s a waylink target node without a source node
  *      * [rend:isTarget]      - Whether it’s a waylink target node
  *      * [rend:isWaybit]      - Whether it’s a waybit
  *      * [rend:isWayscript]   - Whether it’s under a ‘data:,wayscript.’ namespace
  *
  *      * eSTag            - Start tag of an element, reproducing content that would otherwise
  *                           be invisible except in the wayscript source
  *          * eQName                   - Qualified name [XMLN] of the element
  *              * [rend:isAnonymous]   - Whether the local part is declared to be anonymous
  *              * ePrefix                  - Namespace prefix, if any
  *                  * [rend:isAnonymous]   - Whether the prefix is declared to be anonymous
  *              * eLocalPart               - Local part of the name
  *          * svg:svg          - Target liner [NR], present if the element is a waylink target node
  *             * svg:text
  *             * svg:path
  *          * targetMarker     - Target marker, likewise
  *
  *      * textAligner  - Present if the element is a step
  *
  *      * forelinker   - Hyperlink effector for a waylink source node
  *          * html:a
  *              * preview  - Preview of the target text
  *              * html:br
  *              * verticalTruncator    - Indicating the source node as such (half a link)
  *              * targetPointer        - Pointing to the target node (the other half)
  *
  *   Key to the notation above
  *   - - - - - - - - - - - - -
  *      * blah         - Element ‘blah’ in namespace NS_REND, the default in this notation
  *      * foo:bar      - Element ‘bar’ in namespace NS_*FOO*
  *          * [attrib]     - Attribute of the element in no namespace
  *          * [foo:attrib] - Attribute of the element in namespace NS_*FOO*
  *          * foo:baz      - Child element ‘baz’
  *
  *      In this notation: unless otherwise marked, an element’s namespace is NS_REND (prefixed ‘rend’)
  *      and an attribute’s is none.
  *
  *
  * DOM EXTENSION
  * -------------
  *   This program adds a property to the DOM.  It does this for internal purposes only.
  *
  *   Waylink target node (Element)
  *   - - - - - - - - - -
  *   * interlinkScene (boolean) Answers whether a waylink is formed on this target node.
  *       That's only its temporary use; later this property will instead point to the *scene* element
  *       that encodes the target node's interlink scene.
  *
  *
  * CONDITION
  * ---------
  *   The following named condition is asserted at whatever point in the code it applies:
  *
  *     TARGID  (of a document)  Every waylink target node of the document has
  *             an HTML *id* attribute equal in value to its wayscript *lid* attribute.
  *         Where the document is unspecified, this condition refers to the present document.
  *
  *
  * NOTES  (continued at bottom)
  * -----
  */
'use strict';
( function()
{


    /** Whether the present document is loaded on a 'file' scheme URL.
      */
    const isDocumentLocallyStored = document.URL.startsWith( 'file:' );



    /** Whether the user can likely edit the present document.
      */
    const isUserEditor = isDocumentLocallyStored;



    /** Whether it appears that the user would be unable to correct faults in this program.
      */
    const isUserNonProgrammer = !isDocumentLocallyStored;



    /** The leading string that is common to all XML namespaces of wayscript.
      * Each namespace begins with this string, and ends by appending to it a unique subnamespace.
      *
      *     @see #SUB_NS_BIT
      *     @see #SUB_NS_COG
      *     @see #SUB_NS_STEP
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



    /** Whether to enforce program constraints whose violations are expensive to detect.
      */
    const toEnforceCostlyConstraints = !isUserNonProgrammer;



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


        /** Returns the same URI, but without a fragment.
          */
        that.defragmented = function( uri )
        {
            // Changing?  sync'd → http://reluk.ca/project/wayic/lex/_/reader.js
            const c = uri.lastIndexOf( '#' );
            if( c >= 0 ) uri = uri.slice( 0, c );
            return uri;
        };



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
          *     @see #normalized
          */
        that.isDetectedAbnormal = function( uri )
        {
            return toEnforceCostlyConstraints && uri != that.normalized(uri)
        };



        /** Returns a message that the given URI is not in normal form.
          */
        that.message_abnormal = function( uri ) { return 'Not in normal form:' + uri; };



        /** Puts the given URI reference through the browser's hyperlink *href* parser,
          * thus converting any relative path to an absolute path (by resolving it against
          * the location of the present document) and otherwise normalizing its form.
          * Returns the normalized form.
          *
          *     @see URI-reference, https://tools.ietf.org/html/rfc3986#section-4.1
          */
        that.normalized = function( ref )
        {
            // Modified from Matt Mastracci.
            // https://grack.com/blog/2009/11/17/absolutizing-url-in-javascript/
            //
            // Apparently this cannot be adapted for use with other documents, to normalize their own,
            // internally encoded references.  At least it fails when an equivalent function is
            // constructed (with parser element, etc.) against another document obtained through the
            // Documents reading facility.  Then the *href* always yields *undefined*.
            //
            // FIX by moving to the more robust method of wayics.lex.
            // http://reluk.ca/project/wayic/lex/_/reader.js

            const div = hrefParserDiv;
            div.firstChild.href = ref; // escaping ref en passant
            div.innerHTML = div.innerHTML; // reparsing it
            return div.firstChild.href;
        };



       // - - -

        return that;

    }() );



  /// ==================================================================================================
 ///  S i m p l e   d e c l a r a t i o n s   i n   l e x i c a l   o r d e r
/// ==================================================================================================



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
 //     let existingNames = element.className;
 //     element.className = existingNames? existingNames + ' ' + names: names );
 // }



    /** Returns the given node if it looks like an element and has the right name,
      * otherwise returns null.
      *
      *     @param name (string) The expected value of the *localName* property.
      *     @param node (Node)
      */
    function asElementNamed( name, node ) { return name == node.localName? node: null; }



    const BREAK_SYMBOL = '\u{1f5d9}'; // Unicode 1f5d9 (cancellation X).  Changing? sync'd → readable.css.



    /** The location of the waycast (string) in normal URL form, and with a trailing slash '/'.
      *
      *     @see URIs#normalized
      */
    let CAST_BASE_LOCATION; // init below, thence constant



    /** The path to the base (root directory) of the waycast, without a trailing slash '/'.
      */
    const CAST_BASE_PATH = ( ()=>
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
                else mal( 'Missing *base* attribute in *cast* element' );
                return path;
            }
        }

        mal( 'Missing *cast* element in document *head*' );
        return path;
    })();


        {
            let loc = URIs.normalized( CAST_BASE_PATH );
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
      *   or a separate document in the case of an outer link.
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
      *
      *     @param source (Element) The source node.
      *     @param preview (Element) Its *preview* element.
      */
    function configureForTargetPreview( source, preview, previewString )
    {
        function clearStyleClass()
        {
            const c = preview.className;
            if( c )
            {
                console.assert( c == 'singleCharacterContent', A ); // removing only that one
                preview.removeAttribute( 'class' );
            }
        }
        const pointCount = countCodePoints( previewString );
        if( pointCount == 0 )
        {
            source.removeAttributeNS( NS_REND, 'hasPreviewString' );
            clearStyleClass();
        }
        else
        {
            source.setAttributeNS( NS_REND, 'hasPreviewString', 'hasPreviewString' );
            if( pointCount == 1 ) preview.className = 'singleCharacterContent';
            else clearStyleClass();
        }
    }



    /** Returns the number of Unicode code points in string *str*.
      *
      *     @see http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types-string-type
      */
    function countCodePoints( str )
    {
        const i = str[Symbol.iterator](); /* Iterates over code points, not just 16-bit 'character' units.
          http://www.ecma-international.org/ecma-262/6.0/#sec-string.prototype-@@iterator */
        let count = 0;
        while( !i.next().done ) ++count;
        return count;
    }



    /** The location of present document (string) in normal URL form.
      *
      *     @see URIs#normalized
      */
    const DOCUMENT_LOCATION = ( ()=>
    {
        // Changing?  sync'd → http://reluk.ca/project/wayic/lex/_/reader.js
        const wloc = window.location; // [WDL]
        let loc = wloc.toString();
        if( wloc.hash ) loc = URIs.defragmented( loc );
        return URIs.normalized( loc ); // to be sure
    })();



    const DOCUMENT_SCENE_ID = '_wayic.read.document_scene';



    const ELEMENT = Node.ELEMENT_NODE;



    /** The string that means *none* when it encodes the local part of a wayscript element's name.
      */
    const ELEMENT_NAME_NONE = '_';



    /** The string that means *same as the target name* when it encodes the local part of the name
      * of a waylink souce node.
      */
    const ELEMENT_NAME_UNCHANGED = '_iso';



    /** Returns the first child of the given node that is a waybit.
      */
    function firstWaybitChild( node )
    {
        const traversal = document.createTreeWalker( node, SHOW_ELEMENT );
        let t = traversal.nextNode();
        for(; t != null; t = traversal.nextSibling() ) if( isBitNS( t.namespaceURI )) return t;
        return null;
    }



    /** Tries quickly to find a waylink target node by its *id* attribute.
      * Returns the target node for the given *id*, or null if there is none.
      * A null result is unreliable until the present document has TARGID.
      */
    function getTargetById( id ) { return Documents.getTargetById( id, document ); }



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
      * or another subnamespace that starts with 'bit.'.
      *
      *     @param subNS (string) A wayscript namespace without the leading NS_WAYSCRIPT_DOT.
      */
    function isBitSubNS( subNS )
    {
        return subNS.startsWith(SUB_NS_BIT) && (subNS.length == 3 || subNS.charAt(3) == '.');
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
        if( !message ) throw 'Null parameter';

        console.error( message );
        if( isUserEditor ) alert( message ); // see readable.css § TROUBLESHOOTING
    }



    const NO_BREAK_SPACE = ' '; // Unicode a0



    /** The XML namespace of waybits simply, excluding subspaced waybits such as steps.
      */
    const NS_BIT  = NS_WAYSCRIPT_DOT + SUB_NS_BIT;



    /** The XML namespace of HTML.
      */
    const NS_HTML = 'http://www.w3.org/1999/xhtml';



    /** The XML namespace of markup specific to this project.
      */
    const NS_REND = 'data:,wayic.read';



    /** The XML namespace of steps.
      */
    const NS_STEP = NS_WAYSCRIPT_DOT + SUB_NS_STEP;



    /** The XML namespace of SVG.
      */
    const NS_SVG = 'http://www.w3.org/2000/svg';



    const PX_PER_EM = ( ()=>
    {
        const body = document.body;
        const svg = body.appendChild( document.createElementNS( NS_SVG, 'svg' ));
        svg.setAttribute( 'width', '100px' );  // ensure coordinate system is initialized [ICS]
        svg.setAttribute( 'height', '100px' );
        const line = svg.appendChild( document.createElementNS( NS_SVG, 'line' ));
        const bV = line.x2.baseVal;
        bV.newValueSpecifiedUnits( SVGLength.SVG_LENGTHTYPE_EMS, 1 );
        bV.convertToSpecifiedUnits( SVGLength.SVG_LENGTHTYPE_PX );
        const px = bV.valueInSpecifiedUnits; // captured before removal
        body.removeChild( svg );
        return px;
    })();



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



    /** Runs this program.
      */
    function run()
    {
        console.assert( (eval('var _tmp = null'), typeof _tmp === 'undefined'), AA + 'Strict mode' );
          // http://www.ecma-international.org/ecma-262/6.0/#sec-strict-mode-code
          // credit Noseratio, https://stackoverflow.com/a/18916788/2402790
        transform(); // provides TARGID for the present document
      // --------------------
      // Layout is now stable, more or less
      // --------------------
        showDocument();
        InterdocScanner.start(); // needs TARGID
        OuterWaylinkResolver.start();
        WayTracer.start(); // needs TARGID
    }



    /** Makes the document visible to the user.
      */
    function showDocument()
    {
        const body = document.body;

      // Place the off-way screen
      // ------------------------
        body.appendChild( document.createElementNS( NS_REND, 'offWayScreen' ));

      // Detect user's lighting preference
      // ---------------------------------
        let lighting;
        let defaultTextColour = window.getComputedStyle(body).getPropertyValue( 'color' );
          // Using 'color' here because somehow 'background-color' fails;
          // it reads as transparent (Firefox) or black (Chrome), when really it's white.
        const cc = defaultTextColour.match( /^\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/ );
        if( cc )
        {
            const red = cc[1], green = cc[2], blue = cc[3]; // each 0-255
            const luma = red * 299 + green * 587 + blue * 114; // 0-255,000, perceived brightness
              // formula: https://en.wikipedia.org/wiki/YIQ
            lighting = luma < 127500? 'paper':'neon';
        }
        else lighting = 'paper'; // defaulting to what's most popular

      // Set lighting switch
      // -------------------
        document.documentElement.setAttributeNS( NS_REND, 'lighting', lighting );

      // Show document
      // -------------
        body.style.setProperty( 'display', 'block' ); // overriding readable.css 'none'
    }



    const TEXT = Node.TEXT_NODE;



    /** Tranforms the present document.  Provides TARGID for it.
      */
    function transform()
    {
        const body = document.body;
        const scene = body.appendChild( document.createElementNS( NS_REND, 'scene' ));
        scene.setAttribute( 'id', DOCUMENT_SCENE_ID );
        for( ;; ) // wrap *body* content in *scene*
        {
            const c = body.firstChild;
            if( c === scene ) break;

            scene.appendChild( c );
        }
        const traversal = document.createTreeWalker( scene, SHOW_ELEMENT, {
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
            const partRendering = new PartRenderingC( t );


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
                    t.insertBefore( entagment, firstWaybitChild(t) );
                    entagment.setAttributeNS( NS_COG, 'link', linkV );
                         t.removeAttributeNS( NS_COG, 'link' );
                    entagment.setAttributeNS( NS_REND, 'isEntagment', 'isEntagment' ); // if only as debug aid
                    break source; // leave it to be processed by a later iteration
                }

                if( lidV )
                {
                    mal( 'Waylink node has both *lid* and *link* attributes: ' + a2s('lid',lidV) );
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
                const tDocLoc = link.targetDocumentLocation;
                let targetPreviewString, targetDirectionChar;
                targeting:
                {
                    if( tDocLoc.length > 0 )
                    {
                        const tDocLocN = URIs.normalized( tDocLoc );
                        if( tDocLocN != DOCUMENT_LOCATION ) // then the target is outside this document
                        {
                            OuterWaylinkResolver.registerLink( t, tDocLocN );
                            targetDirectionChar = '→'; // '→' is Unicode 2192 (rightwards arrow)
                            partRendering.isChangeable = true;
                            targetPreviewString = '⌚'; // '⌚' is Unicode 231a (watch) = pending symbol
                            break targeting;
                        }
                    }

                    // the target is within this document
                    let target = getTargetById( link.targetID );
                    if( target ) targetDirectionChar = '↑'; // '↑' is Unicode 2191 (upwards arrow)
                    else // it should be in nodes below, where transform has yet to reach it and set its 'id'
                    {
                        const traversal = document.createTreeWalker( scene, SHOW_ELEMENT ); // search for it
                        let u = lastNode( traversal );        // from last node
                        for(;; u = traversal.previousNode() ) // travel upward
                        {
                            if( u == t ) // then search is on this node, about to revisit the nodes above
                            {
                                mal( 'Broken waylink: Either this document has no matching *lid*, '
                                  + 'or it has an identifier conflict: ' + a2s('link',linkV) );
                                targetDirectionChar = '↕'; // '↕' is Unicode 2195 (up down arrow)
                                targetPreviewString = BREAK_SYMBOL;
                                t.setAttributeNS( NS_REND, 'isBroken', 'isBroken' );
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

                    configureForTarget( tNS, tLocalPart, linkV, isBit, target, partRendering );
                    targetPreviewString = readTargetPreview( target );
                }
                const forelinker = t.appendChild( document.createElementNS( NS_REND, 'forelinker' ));
                const a = forelinker.appendChild( document.createElementNS( NS_HTML, 'a' ));
                a.setAttribute( 'href', tDocLoc + '#' + link.targetID );
                a.appendChild( preview );
                preview.appendChild( document.createTextNode( targetPreviewString ));
                configureForTargetPreview( t, preview, targetPreviewString );
                a.appendChild( document.createElementNS( NS_HTML, 'br' ));
                a.appendChild( document.createElementNS( NS_REND, 'verticalTruncator' ))
                 .appendChild( document.createTextNode( '⋱⋱' ));
                    // '⋱' is Unicode 22f1 (down right diagonal ellipsis)
                a.appendChild( document.createElementNS( NS_REND, 'targetPointer' ))
                 .appendChild( document.createTextNode( targetDirectionChar ));
            }


         // =========
         // Start tag of element t
         // =========
            partRendering.render();
            const eSTag = partRendering.eSTag;
            if( lidV ) // then t is a waylink target node
            {
                t.setAttributeNS( NS_REND, 'isTarget', 'isTarget' );
                t.setAttributeNS( NS_REND, 'isOrphan', 'isOrphan' ); // till proven otherwise
                Documents.idAsHyperlinkToo( t, lidV );
                const targetMarker = document.createElementNS( NS_REND, 'targetMarker' );
                targetMarker.appendChild( document.createTextNode( NO_BREAK_SPACE )); /* to be sure;
                  see readable.css for the visible content */
                TargetLining.appendNewLiner( eSTag, targetMarker );
                eSTag.appendChild( targetMarker );
                Targets.initTarget( t, eSTag, /*idV*/lidV ); // idV = lidV ensured by ↖ idAsHyperlinkToo
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
                    const eQName = asElementNamed( 'eQName', eSTag.firstChild );
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



    /** Answers whether the given HTML element is very likely to be rendered in line by the browser.
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



  /// ==================================================================================================
 ///  C o m p o u n d   d e c l a r a t i o n s   i n   l e x i c a l   o r d e r
/// ==================================================================================================



    /** A reader of documents.
      */
    class DocumentReader // Changing?  sync'd → http://reluk.ca/project/wayic/lex/_/reader.js
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


    /** The generalized record of a wayscript document.
      */
    class DocumentRegistration // Changing?  sync'd → http://reluk.ca/project/wayic/lex/_/reader.js
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



   // ==================================================================================================


    /** Dealing with wayscript documents at large, not only the present document.
      */
    const Documents = ( function() // Changing?  sync'd → http://reluk.ca/project/wayic/lex/_/reader.js
    {

        const that = {}; // the public interface of Documents



        function d_mal( doc, message )
        {
            if( !doc ) throw 'Null parameter';

            if( doc == document ) mal( message );
        }



        function notifyReader( r, docReg, doc )
        {
            if( doc ) r.read( docReg, doc );
            r.close( docReg );
        }


        /** The reader of all documents as registered by *addOmnireader*, or null if there is none.
          */
        let omnireader = null;



        const PRESENT_DOCUMENT_REGISTRATION = new DocumentRegistration( DOCUMENT_LOCATION, document );



        /** Map of pending and complete document registrations, including that of the present document.
          * The entry key is DocumentRegistration#location.  The value is either the registration itself
          * or the readers (Array of DocumentReader) that await it.
          */
        const registry = new Map().set( DOCUMENT_LOCATION, PRESENT_DOCUMENT_REGISTRATION );



       // - P u b l i c --------------------------------------------------------------------------------


        /** Registers a reader of all documents.  Immediately the reader is given the present document,
          * and all documents that were retrieved in the past.  Any documents retrieved in future will
          * be given as they arrive.
          *
          *     @throws (string) Error message if one reader was already registered;
          *       the support for multiple readers is not yet coded.
          */
        that.addOmnireader = function( reader )
        {
            if( omnireader !== null ) throw 'Cannot add reader, one was already added';

            omnireader = reader;
            for( const mapping of registry )
            {
                const entry = mapping[1];
                if( !( entry instanceof DocumentRegistration )) continue; // registration is pending

                notifyReader( reader, entry, entry.document );
            }
        };



        /** Returns the waylink target node (Element) with the given *id* attribute,
          * or null if the given document has none.
          *
          *     @param id (string)
          *     @param doc (Document) A TARGID document.
          */
        that.getTargetById = function( id, doc )
        {
            let e = doc.getElementById( id );
            if( e )
            {
                const lidV = e.getAttributeNS( NS_COG, 'lid' );
                if( lidV == id ) return e;
            }

            return null;
        };



        /** Ensures that the given target node has one of the following: either
          * (1) an *id* attribute that is both equal to the *lid* attribute,
          *     and unique within its document, as required for an XML *ID* type; or
          * (2) no *id* attribute.
          *
          *     @param t (Element) A waylink target node.
          *     @param lidV (string) The value of t's *lid* attribute.
          */
        that.idAsHyperlinkToo = function( t, lidV )
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



        /** Tries to retrieve the indicated document for the given reader.  If *docLoc* indicates
          * the present document, then immediately the reader is given the present document as is,
          * followed by a call to reader.close.
          *
          * <p>Otherwise this method starts a retrieval process.  It may return early and leave
          * the process to finish later.  If the process succeeds, then it provides TARGID for the
          * document and calls reader.read.  Regardless it always finishes by calling reader.close.</p>
          *
          *     @param docLoc (string) The document location in normal URL form.
          *     @param reader (DocumentReader)
          *
          *     @see URIs#normalized
          */
        that.readNowOrLater = function( docLoc, reader )
        {
            if( URIs.isDetectedAbnormal( docLoc )) throw URIs.message_abnormal( docLoc );

            const entry = registry.get( docLoc );
            if( entry )
            {
                if( entry instanceof DocumentRegistration ) notifyReader( reader, entry, entry.document );
                else // registration is pending
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
                req.onabort = function( e ) { console.warn( 'Document request aborted: ' + docLoc ); };

              // error
              // - - -
                /** @param e (Event) Unfortunately this is a mere ProgressEvent, at least on Firefox,
                  *   which contains no useful information on the specific cause of the error.
                  */
                req.onerror = function( e ) { console.warn( 'Document request failed: ' + docLoc ); };

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
                        if( lidV ) Documents.idAsHyperlinkToo( t, lidV );
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
                    if( omnireader !== null ) notifyReader( omnireader, docReg, doc )
                };

              // time out
              // - - - - -
                req.ontimeout = function( e ) { console.warn( 'Document request timed out: ' + docLoc ); };
            }

          // Send the request
          // ----------------
            req.send();
        };



       // - - -

        return that;

    }() );






   // ==================================================================================================


    /** A scanner of related documents.  It discovers related documents, scans them for references
      * to the present document, and updates the rendering of the present document based on the results.
      */
    const InterdocScanner = ( function()
    {

        const that = {}; // the public interface of InterdocScanner



        /** @param doc (Document) The document to scan.
          * @param docLoc (String) The location of the document in normal form.
          */
        function scan( doc, docLoc )
        {
            const traversal = doc.createNodeIterator( doc, SHOW_ELEMENT );
            for( ;; )
            {
                const t = traversal.nextNode();
                if( t == null ) break;

                const linkV = t.getAttributeNS( NS_COG, 'link' );
                if( !linkV ) continue;

                let link;
                try { link = new LinkAttribute( linkV ); }
                catch( unparseable ) { continue; }

                // No need here to fend against other types of malformed link declaration.
                // Rather take it as the wayscribe intended.
                let tDocLoc = link.targetDocumentLocation;
                tDocLoc = tDocLoc? URIs.normalized(tDocLoc): docLoc;
                if( tDocLoc != DOCUMENT_LOCATION ) continue;

                const target = document.getElementById( link.targetID ); // assumes TARGID
                if( !target) continue;

                if( target.interlinkScene ) continue; // the work is already done

                target.interlinkScene = true;
                target.removeAttributeNS( NS_REND, 'isOrphan' );
            }
        }



       // - P u b l i c --------------------------------------------------------------------------------


        /** Starts this scanner.  It requires TARGID for the present document.
          */
        that.start = function()
        {
          // Enable passive discovery
          // ------------------------
            Documents.addOmnireader( new class extends DocumentReader
            {
                read( docReg, doc ) { scan( doc, docReg.location ); }
            });

          // Start active discovery
          // ----------------------
          //// TODO.  Start by traversing the waycast directory indeces.
            // Though the DOM for these on a 'file' scheme URL is self generated by the browser,
            // still it seems to be accessible (console tests, Chrome and Firefox).
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
          *       project-specific (NS_REND) elements.
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
          *     @throws (string) Error message if the value cannot be parsed.
          */
        constructor( value )
        {
            this._value = value;
            let loc = URIs.defragmented( value ); // document location
            {
                const fragment = value.slice( loc.length + 1 );
                if( !fragment ) throw "Missing target node identifier '#': " + a2s('link',value);

                this._targetID = fragment;
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


    /** A device to complete the rendering of outer waylinks, those whose target nodes are outside
      * of the present document.  It fetches the documents, reads their target nodes and amends
      * the rendered wayscript accordingly.
      */
    const OuterWaylinkResolver = ( function()
    {

        const that = {}; // the public interface of OuterWaylinkResolver



        const MYSTERY_SYMBOL = '?';



        function setTargetPreview( sourceNode, newPreviewString )
        {
            const forelinker = sourceNode.lastChild;
            const preview = asElementNamed( 'preview', forelinker.firstChild/*a*/.firstChild );
            const previewText = preview.firstChild;
            previewText.replaceData( 0, previewText.length, newPreviewString );
            configureForTargetPreview( sourceNode, preview, newPreviewString );
        }



        /** Map of source nodes to resolve.  The entry key is the location of a document (string)
          * in normal URL form.  The value is a list of all source nodes (Array of Element)
          * within the *present* document that target the *keyed* document.
          */
        const sourceNodeRegistry = new Map();



       // - P u b l i c --------------------------------------------------------------------------------


        /** Tells this resolver of an outer link to be resolved.
          *
          *     @param sourceNode (Element) A source node that has an outer target.
          *     @param tDocLoc (string) The document location in normal URL form.
          *
          *     @see URIs#normalized
          */
        that.registerLink = function( sourceNode, tDocLoc )
        {
            if( URIs.isDetectedAbnormal( tDocLoc )) throw URIs.message_abnormal( tDocLoc );

            let sourceNodes = sourceNodeRegistry.get( tDocLoc );
            if( sourceNodes === undefined )
            {
                sourceNodes = [];
                sourceNodeRegistry.set( tDocLoc, sourceNodes );
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
                const tDocLoc = entry[0];
                const sourceNodes = entry[1];
                Documents.readNowOrLater( tDocLoc, new class extends DocumentReader
                {
                    close( docReg )
                    {
                        if( docReg.document == null )
                        {
                            for( const s of sourceNodes ) setTargetPreview( s, MYSTERY_SYMBOL );
                        }
                        sourceNodeRegistry.delete( tDocLoc );
                    }

                    read( docReg, tDoc )
                    {
                      // Try to resolve waylinks, re-rendering the source node of each
                      // -----------------------
                        const traversal = tDoc.createNodeIterator( tDoc, SHOW_ELEMENT );
                        tt: for( ;; ) // seek the target nodes in *that* document [OWR]
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
                                if( sourceNodes.length == 0 ) break tt; // done with this tDoc

                            } while( --s >= 0 )
                        }

                      // Mark any remaining source nodes as broken
                      // -----------------------------------------
                        for( const s of sourceNodes )
                        {
                            const linkV = s.getAttributeNS( NS_COG, 'link' );
                            mal( 'Broken link: No matching *lid* in that document: ' + a2s('link',linkV) );
                            setTargetPreview( s, BROKEN_SOURCE_NODE_STRING );
                            s.setAttributeNS( NS_REND, 'isBroken', 'isBroken' );
                        }
                    }
                });
            }
        };



       // - - -

        return that;

    }() );



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
                lp = '●'; // Unicode 25cf (black circle)
                eQName.setAttributeNS( NS_REND, 'isAnonymous', 'isAnonymous' );
            }
            else if( lp.charAt(0) != '_' ) lp = lp.replace( /_/g, NO_BREAK_SPACE ); /* If it starts
              with a non-underscore, which hopefully means it has some letters or other visible content,
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
            const eSTag = asElementNamed( 'eSTag', element.firstChild );
            if( !eSTag ) throw 'Missing eSTag';

            element.removeChild( eSTag );

            // remove any attributes that might have been set:
            element.removeAttributeNS( NS_REND, 'hasLeader' );
            element.removeAttributeNS( NS_REND, 'hasShortName' );
            element.removeAttributeNS( NS_REND, 'isChangeable' );
        }

    }



   // ==================================================================================================


    /** Vector graphics and scene switching for waylink target nodes.<pre>
      *
      *                                 marker          start tag
      *                target liner        ╲               ╱
      *        ┌——————————————————————————┐ ╲             ╱
      *                                      ╲  1waybit  ╱
      *                                       ╲         ╱                           ┐
      *         ∙ ·  ·   ·    ·     ·          ·    2target                         │ target
      *        ╱       │                                Second waybit text content  │  node
      *       ╱        │                        3waybit                             ┘
      *      ╱         │                            Third waybit text content
      *     ╱   ∙ ·  · │ ·    ·              ·  4target
      *   edge         │                            Fourth waybit text content
      *   mark       target
      *               line
      *
      * </pre><p>On the pointer (↖) crossing any DOM-formal part of the start tag,
      * including the target liner, the target marker reveals itself in full:</p><pre>
      *
      *                                         1waybit
      *
      *         ∙ ·  ·   ·    ·     ·          ◉    2target
      *                      ↖                          Second waybit text content
      *                                         3waybit
      *                                             Third waybit text content
      *         ∙ ·  ·   ·    ·              ·  4target
      *                                             Fourth waybit text content
      * </pre>
      */
    const TargetLining = ( function()
    {

        const that = {}; // the public interface of TargetLining

        // Dimensions and coordinates are given in pixel units, except where marked otherwise.



        const EDGE_MARK_WIDTH = 0.3/*em*/ * PX_PER_EM;

        const EDGE_MARK_RADIUS = EDGE_MARK_WIDTH / 2;



        /** The allowance for rounding errors and other imprecisions in graphics rendering.
          */
        const GRAPHICAL_ERROR_MARGIN = 0.01;



        const LINE_MARGIN = 2/*em*/ * PX_PER_EM;



        /** The maximum, formal gap between the liner and the marker to its right.  The *visual* gap
          * may be wider depending on how the liner draws its content.
          */
        const MAX_GAP = 1.5/*em*/ * PX_PER_EM; // Wherein the pointer style defaults, indicating that
                                               // the two components have distinct control functions.


        const MIN_CLICK_WIDTH_EM = 0.8; // Changing? sync'd → readable.css



        /** The minimum, formal gap between the liner and the marker to its right.
          */
        const MIN_GAP_EM = 0.6; // Changing? sync'd → readable.css

        const MIN_GAP = MIN_GAP_EM * PX_PER_EM;



        const MIN_WIDTH = MIN_CLICK_WIDTH_EM * PX_PER_EM;

            { console.assert( EDGE_MARK_WIDTH - MIN_WIDTH /* error */ <= GRAPHICAL_ERROR_MARGIN, A ); }



        /** Draws or redraws the given target liner, and sets it displayable if it wasn't.
          *
          *     @param liner (SVGSVGElement) The target liner.
          *     @param markerVpBounds (DOMRectReadOnly) The bounds within the scroller's viewport of
          *       the associated target marker.  If undefined, then this parameter is determined anew.
          */
        function redraw( liner,
          markerVpBounds = asElementNamed('targetMarker',liner.nextSibling).getBoundingClientRect() )
        {
            let displayStyle = 'none'; // default
            try
            {
              // Fit within left margin
              // ----------------------
                let width;
                {
                    const scrollX = window.scrollX;
                    const tagVpBounds = liner.parentNode/*eSTag*/.getBoundingClientRect();
                    const tagMargin = tagVpBounds.left + scrollX;
                    liner.style.setProperty( 'left'/*[SC]*/, -tagMargin + 'px' );
                    const markerMargin = markerVpBounds.left + scrollX;
                    const availableGap = markerMargin - MIN_WIDTH;
                    if( MIN_GAP - availableGap /* error */ > GRAPHICAL_ERROR_MARGIN )
                    {
                        console.assert( false, AA + 'availableGap ' + availableGap + ' ≥ MIN_GAP ' + MIN_GAP );
                        return;
                    }

                    const gap = availableGap > MAX_GAP? MAX_GAP: availableGap;
                    width = markerMargin - gap;
                }
                liner.setAttribute( 'width', width + 'px' );

              // Span height of marker  (as opposed to the whole tag, which might have multiple lines)
              // ---------------------
                const height = markerVpBounds.height;
                liner.setAttribute( 'height', height + 'px' );

              // Draw the line
              // -------------
                const midY = height / 2; // vertically centered
                {
                    const line = asElementNamed( 'path', liner.lastChild );
                    const startX = width - width / 4;
                    const lineWidth = startX - LINE_MARGIN;
                    let display = 'inline';
                    if( lineWidth < LINE_MARGIN ) display = 'none';
                    else line.setAttribute( 'd',
                      // [PD]         X            Y
                      //         -----------      ----
                         'M ' +    startX + ' ' + midY
                      + ' H ' +  LINE_MARGIN
                      );
                    line.style.display = display;
                }

              // Draw the edge mark
              // ------------------
                const mark = asElementNamed( 'circle', liner.firstChild );
                mark.setAttribute(  'r', EDGE_MARK_RADIUS + 'px' );
                mark.setAttribute( 'cx', EDGE_MARK_RADIUS + 'px' ); // abutting the document edge
                mark.setAttribute( 'cy', midY + 'px' );

              // Ensure the liner is visible
              // ---------------------------
                displayStyle = 'block'; // overriding readable.css 'none'
            }
            finally { liner.style.setProperty( 'display', displayStyle ); }
        }



       // - P u b l i c --------------------------------------------------------------------------------


        /** Constructs a target liner (*svg* element) and appends it to the given start tag.
          *
          *     @param eSTag (Element) The start tag of the target node.
          *     @param targetMarker (Element) The associated target marker.
          */
        that.appendNewLiner = function( eSTag, targetMarker )
        {
          // Construct and append
          // --------------------
            const liner = eSTag.appendChild( document.createElementNS( NS_SVG, 'svg' ));
            liner.appendChild( document.createElementNS( NS_SVG, 'circle' )); // edge mark
            liner.appendChild( document.createElementNS( NS_SVG, 'path' ));  // line

          // Show
          // ----
            tryShow();
            function tryShow( _msTime = null )
            {
                const markerVpBounds = targetMarker.getBoundingClientRect();
                if( markerVpBounds.width )
                {
                    redraw( liner, markerVpBounds );
                    window.addEventListener( 'resize', ()=>{redraw(liner);} );
                }
                else window.requestAnimationFrame( tryShow ); // wait for the marker to get laid
            }
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



        /** Returns the fragment part of window.location without the preceding delimiter character '#',
          * or null if the fragment part is missing.  Caches the return value in *idActuallyTargetedC*.
          */
        function idActuallyTargeted()
        {
            const hash = window.location.hash; // [WDL]
            idActuallyTargetedC = hash.length == 0? null: hash.slice(1);
            return idActuallyTargetedC;
        }



        /** Cache of the last value returned from *idActuallyTargeted*.
          */
        let idActuallyTargetedC; { idActuallyTargeted(); }



        function formAsTargeted( target ) // companion to 'target:' rules in readable.css
        {
            // Pending a distinction of targeted and untargeted forms, which is expected in future,
            // simply register the formal fact:
            targetFormallyTargeted = target;
        }



        function formAsUntargeted( target )
        {
            if( target == targetFormallyTargeted ) targetFormallyTargeted = null;
        }



        function handleClick( event )
        {
            let e = event.target; // clicked element
            if( e.namespaceURI == NS_SVG ) return; // target liner, click function not yet coded

            while( e.localName != 'eSTag' ) e = e.parentNode; // rising from the clicked child
            const targetNode = e.parentNode;

            const view = document.scrollingElement; // within the viewport
            const scrollTopWas = view.scrollTop;
            const scrollLeftWas = view.scrollLeft;

          // Toggle the browser location, targeted ⇄ untargeted
          // ---------------------------
            const wloc = window.location; // [WDL]
            if( targetNode == targetFormallyTargeted ) // then transit targeted → untargeted
            {
                wloc.hash = ''; // navigating to the untargeted location, no URI fragment in address bar
                const loc = wloc.toString();
                if( loc.endsWith( '#' )) // Then it left the fragment delimiter hanging there, visible,
                {                 // like the grin of the Cheshire Cat (Firefox, Chrome).  Remove it:
                    history.replaceState( /*same*/history.state, /*same*/document.title, loc.slice(0,-1) );
                }
            }
            else wloc.hash = targetNode.getAttribute( 'id' ); // untargeted → targeted

          // Stabilize the view within the viewport
          // ------------------
            view.scrollTop = scrollTopWas;
            view.scrollLeft = scrollLeftWas;
        }



        /** The waylink target node that was actually hyperlink targeted by the browser
          * and remains visibly formed as such, or null if there is none.
          *
          *     @see #idActuallyTargeted
          */
        let targetFormallyTargeted = null;



       // - P u b l i c --------------------------------------------------------------------------------


        /** Initializes a target node.
          *
          *     @param idV (string) The value of the target node's *id* attribute.
          */
        that.initTarget = function( target, eSTag, idV )
        {
            eSTag.addEventListener( 'click', handleClick );
            if( idV == idActuallyTargetedC ) formAsTargeted( target );
            else formAsUntargeted( target );
        };



       // - - -

        window.addEventListener( 'hashchange', function( _event/*ignored*/ )
        {
            if( targetFormallyTargeted ) formAsUntargeted( targetFormallyTargeted );
            if( idActuallyTargeted() )
            {
                const target = getTargetById( idActuallyTargetedC );
                if( target ) formAsTargeted( target );
            }
        });

        return that;

    }() );



   // ==================================================================================================


    /** A device for tracing the way across multiple waylinked documents.  It traces the root document's
      * waylinks to their target documents, thence onward till it traces the full network of waylinks.
      * The trace serves two purposes: (1) to discover documents for omnireaders; and (2) to adjust the
      * rendering of the present document based on the results.
      *
      *     @see http://reluk.ca/project/wayic/lex/root#root_document
      *     @see Documents#addOmnireader
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



        const MESSAGE_NO_BODY = 'Malformed document: Missing HTML *body* element';



        /** Constructs a trace leg identifier (string) for the specified target.
          * Each trace leg is scoped to single DOM branch exclusive of waylinks.
          *
          *     @param tDocLoc (string) The target document location in normal URL form.
          *     @param targetID (string)
          */
        function newLegID( tDocLoc, targetID )
        {
            if( tDocLoc == ROOT_DOCUMENT_LOCATION ) return ROOT_LEG_ID;
              // All targets of the root document are here assigned the same identifier.  This can be
              // understood either (a) logically as a consequence of the exception of tracing the root
              // document as a whole in a single leg, all of a piece; or (b) practically as a method of
              // helping the code to isolate the root targets for special treatment (basically to ignore
              // them) and so to shield itself from the consequences of this exception.

            return tDocLoc + '#' + targetID;
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



        /** The normal-form location (URL string) of the root document.
          *
          *     @see http://reluk.ca/project/wayic/lex/root#root_document
          *     @see URIs#normalized
          */
        const ROOT_DOCUMENT_LOCATION = CAST_BASE_LOCATION + 'visionary/way.xht';



        /** The identifier of the root leg of the trace.  The root leg comprises the root document
          * as a whole.
          */
        const ROOT_LEG_ID = 'ROOT'; // unlike other legs, which are identified by target URL



        /** Moves the given leg identifier from legsOpen to legsShut,
          * then starts decorating if all legs are now shut.
          *
          *     @throws (string) Error message if legID is missing from legsOpen.
          *
          *     @see #newLegID
          *     @see #isShut
          */
        function shutLeg( legID )
        {
            const o = legsOpen.indexOf( legID );
            if( o < 0 ) throw 'Leg is not open: ' + legID;

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
         // console.debug( 'Trace run complete' ); // TEST
        }



        /** Ensures that the specified leg is fully traced before returning.
          * May return with any number of its waylinked legs yet untraced,
          * each slated for a separate tracing.
          *
          *     @see #newLegID
          *     @param branch (Element) Base element of the branch that comprises the leg.
          *     @param docReg (DocumentRegistration)
          */
        function traceLeg( legID, branch, docReg )
        {
            const docLoc = docReg.location;
            const doc = branch.ownerDocument;
            if( doc == document )
            {
                branch.setAttributeNS( NS_REND, 'isOnWayBranch', 'isOnWayBranch' );
             // console.debug( '\t\t\t(in present document)' ); // TEST
            }
            const traversal = doc.createTreeWalker( branch, SHOW_ELEMENT );
            for( ;; )
            {
                const t = traversal.nextNode();
                if( t == null ) break;

              // Source node
              // -----------
                const linkV = t.getAttributeNS( NS_COG, 'link' );
                source: if( linkV )
                {
                    let link;
                    try { link = new LinkAttribute( linkV ); }
                    catch( unparseable ) { break source; }

                    // No need here to fend against other types of malformed declaration.
                    // Rather let the trace extend as the wayscribe intended.
                    let tDocLoc = link.targetDocumentLocation;
                    tDocLoc = tDocLoc? URIs.normalized(tDocLoc): docLoc;
                    const targetID = link.targetID;
                    const targetLegID = newLegID( tDocLoc, targetID );
                    if( wasOpened( targetLegID )) break source;

                    openLeg( targetLegID );
                    Documents.readNowOrLater( tDocLoc, new class extends DocumentReader
                    {
                        close( tDocReg )
                        {
                            if( tDocReg.document == null ) shutLeg( targetLegID );
                            // else readDirectly has (or will) shut it
                        }

                        read( tDocReg, tDoc ) /* The call to this method might come now or later,
                          but the method itself ensures that any actual reading is done only later,
                          after the present leg is fully traced and marked shut.  Thus it enables
                          optimizations elsewhere in the code that depend on such ordering. */
                        {
                            const wasCalledLate = isShut( legID );
                            const readMethod = wasCalledLate? this.readDirectly: this.readLater;
                            readMethod.call( this, tDocReg, tDoc );
                        }

                        readDirectly( tDocReg, tDoc )
                        {
                            const target = Documents.getTargetById( targetID, tDoc ); // assumes TARGID
                            subTrace: if( target )
                            {
                              // Shield the sub-trace work with a rootward scan
                              // ----------------------------------------------
                                for( let r = target;; )
                                {
                                    r = r.parentNode;
                                    const ns = r.namespaceURI;
                                    if( ns == null ) // then r is the document node
                                    {
                                        mal( MESSAGE_NO_BODY + ': ' + tDocLoc );
                                        break;
                                    }

                                    if( isBitNS( ns ))
                                    {
                                        const lidV = r.getAttributeNS( NS_COG, 'lid' );
                                        if( !lidV ) continue;

                                        if( isShut( newLegID( tDocLoc, lidV ))) break subTrace;
                                          // If only for sake of efficiency, ∵ this target branch is
                                          // already covered (or will be) as part of a larger branch.
                                    }
                                    else if( r.localName == 'body' && ns == NS_HTML ) break;
                                }

                              // Sub-trace
                              // ---------
                                traceLeg( targetLegID, target, tDocReg );
                            }
                            else console.warn( 'Broken waylink truncates trace at leg: ' + targetLegID );
                            shutLeg( targetLegID );
                        }

                        readLater( tDocReg, tDoc )
                        {
                         // setTimeout( this.readDirectly, /*delay*/0, tDocReg, tDoc );
                         /// but more efficiently (as a microtask) and properly bound as a method call:
                            Promise.resolve().then( function()
                            {
                                this.readDirectly( tDocReg, tDoc );
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


        /** Starts this tracer.  It requires TARGID for the present document.
          */
        that.start = function()
        {
         // console.debug( 'Trace run starting' ); // TEST
            const id = ROOT_LEG_ID;
            console.assert( !wasOpened(id), A );
            openLeg( id );
            Documents.readNowOrLater( ROOT_DOCUMENT_LOCATION, new class extends DocumentReader
            {
                close( docReg ) { shutLeg( id ); }
                read( docReg, doc )
                {
                    const html = doc.documentElement;
                    let t; // element to trace
                    if( doc == document ) t = document.getElementById( DOCUMENT_SCENE_ID );
                    else // find the *body* element
                    {
                        const traversal = doc.createTreeWalker( html, SHOW_ELEMENT );
                        for( t = traversal.nextNode();; t = traversal.nextSibling() )
                        {
                            if( t == null )
                            {
                                mal( 'Unable to trace: ' + MESSAGE_NO_BODY + ': ' + ROOT_DOCUMENT_LOCATION );
                                return;
                            }

                            if( t.localName == 'body' && t.namespaceURI == NS_HTML ) break;
                        }
                    }
                    traceLeg( id, t, docReg );
                }
            });
        };



       // - - -

        return that;

    }() );



////////////////////

    run();

}() );


/** NOTES
  * -----
  *  [C2] The constructor of PartRenderingC2 must remove all such markup.
  *
  *  [F]  Documents won’t reliably load when rendering a wayscript file on a file-scheme URL.
  *       See support file _wayic.read.local_access.xht.
  *
  *  [HI]  https://www.w3.org/TR/html5/browsers.html#the-history-interface
  *
  *  [ICS]  https://www.w3.org/TR/SVG11/coords.html#InitialCoordinateSystem
  *
  *  [NPR]  URI network-path reference, https://tools.ietf.org/html/rfc3986#section-4.2
  *
  *  [NR]  Here avoiding NS_REND in favour of a standard element such as HTML or SVG.
  *        This is for sake of standard properties such as *style*, which NS_REND elements lack.
  *
  *  [OWR]  OuterWaylinkResolver might run marginally faster if (instead) it began the traversal
  *         with the source nodes and sought the target of each using (new) Documents.getTargetById.
  *
  *  [PD]  The path data could instead be defined using the new SVGPathData interface.
  *        But this (array-form instead of string-form definition) wouldn’t help enough to outweigh
  *        the bother of using a polyfill.  https://github.com/jarek-foksa/path-data-polyfill.js
  *
  *  [SC]  Support for this CSS property seems to be undocumented.
  *        https://www.w3.org/TR/SVG11/styling.html#SVGStylingProperties
  *
  *  [WDL]  Either ‘document.location’ or ‘window.location’, they are identical.
  *         https://www.w3.org/TR/html5/browsers.html#the-location-interface
  */


// Copyright © 2017 Michael Allan and contributors.  Licence MIT.
