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
  *      * [isOnWayBranch] · Whether this element is (with all of its descendants) on way
  *
  *   html:html
  *   - - - - -
  *      * [lighting] · Either ‘paper’ for black on white effects, or ‘neon’ for the reverse
  *
  *   html:body
  *   - - - - -
  *      * scene      · Document scene
  *          * [:id]   · ‘_wayic.read.document_scene’
  *      * scene        · Interlink scene(s), if any
  *          * [:class] · ‘interlink’
  *        scene
  *          ⋮
  *
  *      * offWayScreen · Overlay screen for off-way styling, q.v. in readable.css.
  *
  *   a  (rend:a, that is)
  *   -
  *      * html:a  · Author’s hyperlink, as opposed to one injected by this renderer
  *      * html:sup · Hyperlink indicator, containing ‘*’, ‘†’ or ‘‡’
  *
  *   Wayscript element
  *   - - - - - - - - -
  *      * [hasLeader]        · Has leading, non-whitespace text?  [BA]
  *      * [hasPreviewString] · Is a waylink source node with a non-empty preview of the target text?
  *      * [hasShortName]     · Has a rendered name no longer than three characters?
  *      * [isBroken]        · Is a waylink source node with a broken target reference?
  *      * [isChangeable]   · Has a rendering that might later change?
  *      * [isComposer]    · Is a composer element?
  *      * [isOrphan]    · Is a waylink target node without a source node?
  *      * [isTarget]   · Is a waylink target node?
  *      * [isWaybit]    · Is a waybit?
  *      * [isWayscript] · Is under a ‘data:,wayscript.’ namespace?
  *
  *      * eSTag       · Start tag of an element, reproducing content that would otherwise be invisible
  *                      except in the wayscript source
  *          * eQName            · Qualified name [XN] of the element
  *              * [isAnonymous]    · Has a local part that is declared to be anonymous?  [BA]
  *              * ePrefix           · Namespace prefix, if any
  *                  * [isAnonymous] · Has a prefix that is declared to be anonymous?
  *              * eLocalPart        · Local part of the name
  *          * html:div             · Marginalis (if element is a waylink target node).  [NNR, ODO]
  *              * svg:svg        · Target liner
  *                 * svg:path   · Line
  *                 * svg:circle · Edge mark
  *              * icon          ·
  *
  *      * textAligner · (if element is a step)
  *
  *      * forelinker             · Hyperlink effector (if element is a waylink source node)
  *          * html:a              ·
  *              * preview          · Preview of the target text
  *              * html:br           ·
  *              * verticalTruncator · Indicating the source node as such (half a link)
  *              * targetPointer     · Pointing to the target node (the other half)
  *
  *   Key to the notation above
  *   - - - - - - - - - - - - -
  *      * blah         · Element ‘blah’ in namespace NS_REND, the default in this notation
  *      * foo:bar        · Element ‘bar’ in namespace NS_*FOO*
  *          * [:attrib]    · Attribute of the element in no namespace
  *          * [foo:attrib] · Attribute of the element in namespace NS_*FOO*
  *          * foo:baz      · Child element ‘baz’
  *
  *      Unless otherwise marked, the namespace of an element or attribute is NS_REND.
  *
  *
  * DOM EXTENSION
  * -------------
  *   This program adds a property to the DOM.  It does this for internal purposes only.
  *
  *   Waylink target node (Element)
  *   - - - - - - - - - -
  *   * interlinkScene (boolean) Answers whether a waylink is formed on this target node.
  *       That’s only its temporary use; later this property will instead point to the *scene* element
  *       that encodes the target node’s interlink scene.
  *
  *
  * CONDITION
  * ---------
  *   The following named condition is asserted at whatever point in the code it applies:
  *
  *     TARGID (of a document)  Every waylink target node of the document has
  *            an HTML *id* attribute equal in value to its wayscript *lid* attribute.
  *            Where the document is unspecified, this condition refers to the present document.
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



    /** The path to the base directory of the waycast, without a trailing slash '/'.
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
                    while( path.endsWith('/') ) path = path.slice( 0, -1 ); // remove any trailing slash
                }
                else tsk( 'Missing *base* attribute in *cast* element' );
                return path;
            }
        }

        tsk( 'Missing *cast* element in document *head*' );
        return path;
    })();


        {
            let loc = URIs.normalized( CAST_BASE_PATH );
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
            tsk( 'Source node namespace (' + sourceNS + ') differs from target node namespace ('
              + targetNS + ') for waylink: ' + a2s('link',linkV) );
            isMalNameReported = true;
        }
        if( !isMalNameReported && !isBit && sourceLocalPart != targetLocalPart )
        {
            tsk( 'Source node name (' + sourceLocalPart + ') differs from target node name ('
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
    const ELEMENT_NAME_UNCHANGED = '_same';



    /** Returns the CSS *em* length of the given element, which is defined as its *font-size*.
      *
      *     @see https://www.w3.org/TR/css-values/#em
      */
    function emLength( element )
    {
        return parseFloat( getComputedStyle(element).getPropertyValue( 'font-size' ));
    }



    /** Tries quickly to find a waylink target node by its *id* attribute.
      * Returns the target node for the given *id*, or null if there is none.
      * A null result is unreliable until the present document has TARGID.
      */
    function getTargetById( id ) { return Documents.getTargetById( id, document ); }



    /** The allowance for rounding errors and other imprecisions in graphics rendering.
      */
    const GRAPHICAL_ERROR_MARGIN = 0.01;



    const HYPERLINK_SYMBOL = '*';

    const HYPERLINK_SYMBOLS = [HYPERLINK_SYMBOL, '†', '‡'];



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



    /** The CSS *rem* length.
      *
      *     @see https://www.w3.org/TR/css-values/#rem
      */
    const REM = emLength( /*root element 'r', sensu 'rem'*/document.documentElement );



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
                if( node.namespaceURI == NS_REND ) return NodeFilter.FILTER_REJECT; /* Bypassing this
                  branch which was introduced in an earlier iteration and needs no more transforming. */

                return NodeFilter.FILTER_ACCEPT;
            }
        });
        let layoutBlock = traversal.currentNode; /* Tracking the nearest container element in the
          current hierarchy path (current element or nearest ancestor) that has a block layout. */
        let layoutBlock_aLast = null; // layout block of the most recent (author's) hyperlink
        let layoutBlock_aCount = 0; // count of such hyperlinks in that block, so far
        tt: for( ;; )
        {
            const t = traversal.nextNode(); // current element
            if( t == null ) break;

          // ============
          // General form of element t
          // ============
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
                layoutBlock = t; // sync'd ← readable.css § Wayscript
            }
            else // element t is non-wayscript
            {
                isHTML = tNS == NS_HTML;
                isBit = isWayscript = false;
                tSubNS = null;
                if( !getComputedStyle(t).getPropertyValue('display').startsWith('inline') ) layoutBlock = t;
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
                    tsk( 'A non-waybit element with a waylink attribute: ' + a2s(attrName,v) );
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
                const aWrapper = document.createElementNS( NS_REND, 'a' );
                t.parentNode.insertBefore( aWrapper, t );
                aWrapper.appendChild( t );
                const sup = document.createElementNS( NS_HTML, 'sup' );
                aWrapper.appendChild( sup );

              // Indicator symbol
              // ----------------
                const symbol = ( ()=>
                {
                    if( layoutBlock != layoutBlock_aLast ) // then t is the 1st hyperlink in this block
                    {
                        layoutBlock_aLast = layoutBlock;
                        layoutBlock_aCount = 0;
                        return HYPERLINK_SYMBOL;
                    }

                    const count = ++layoutBlock_aCount; // t is a *subsequent* hyperlink in this block
                    return HYPERLINK_SYMBOLS[count % HYPERLINK_SYMBOLS.length]; // next in rotation
                })();
                sup.appendChild( document.createTextNode( symbol ));
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
                if( lidV )
                {
                    tsk( 'A waylink node with both *lid* and *link* attributes: ' + a2s('lid',lidV) );
                    break source;
                }

                if( !isDeclaredEmpty )
                {
                    tsk( 'A waylink source node with content: ' + a2s('link',linkV) );
                    break source;
                }

                let link;
                try { link = new LinkAttribute( linkV ); }
                catch( unparseable )
                {
                    tsk( unparseable );
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
                                tsk( 'Broken waylink: Either this document has no matching *lid*, '
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

              // Marginalis
              // ----------
                const marginalis = eSTag.appendChild( document.createElementNS( NS_HTML, 'div' ));
                marginalis.appendChild( TargetLining.newLiner() );
                marginalis.appendChild( document.createElementNS( NS_REND, 'icon' ))
                  .appendChild( document.createTextNode( NO_BREAK_SPACE )); // to be sure
                    // see readable.css for the *visible* content
                Marginalia.layWhen( marginalis, eSTag );

              // -----
                TargetControl.addControls( t, eSTag, /*idV*/lidV );
                  // that idV = lidV is assured by idAsHyperlinkToo, further above
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
                        if( c == '\n' || c == '\r' ) break alignment; /* Not in line with start tag,
                          needs no special alignment. */
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



    /** Reports a problem that a user with write access to the document might be able to redress,
      * such as malformed wayscript.
      */
    function tsk( message )
    {
        if( !message ) throw 'Null parameter';

        console.error( message );
        if( isUserEditor ) alert( message ); // see readable.css § TROUBLESHOOTING
    }



    /** The empty string as a parameter for CSSStyleDeclaration.setProperty,
      * which instead has the effect of *removeProperty*.
      *
      *     @see https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-setproperty
      */
    const UNSET_STYLE = '';



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



        function d_tsk( doc, message )
        {
            if( !doc ) throw 'Null parameter';

            if( doc == document ) tsk( message );
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
                else d_tsk( doc, 'Element with ' + a2s('lid',lidV) + ' has non-matching ' + a2s('id',idV) );
            }
            const e = doc.getElementById( lidV );
            if( e ) d_tsk( doc, 'Element with ' + a2s('lid',lidV) + ' has non-unique *id*' );
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
                req.onload = function( event )
                {
                    // If this listener is registered instead by req.addEventListener, then local load
                    // access fails on Firefox (52), even the in-branch requests. [readable.css WLL]
                    const doc = event.target.response;
                    docReg.document = doc;

                  // Set the *id* attribute of each waylink target node
                  // ----------------------
                    const traversal = doc.createNodeIterator( doc, SHOW_ELEMENT );
                    for( traversal.nextNode()/*onto the document node itself*/;; )
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
                req.onloadend = function( _event/*ignored*/ )
                {
                    // Parameter *_event* is a ProgressEvent, which contains no useful information.
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
            for( traversal.nextNode()/*onto the document node itself*/;; )
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
                if( !fragment ) throw "Missing fragment sign '#' in target identifier: " + a2s('link',value);

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


    /** Dealing with marginalia, singular 'marginalis'.  The marginalis is a logical component of
      * the start tag (*eSTag*) in waylink target nodes.  Nonetheless it lies to the left of the tag,
      * where it spans the distance from the page edge to the tag.<pre>
      *
      *        ┌—————————— marginalis —————————————┐
      *                                       icon         tag name
      *        ┌—————— target liner ——————┐  ┌—————┐       ╱
      *                                                   ╱
      *                                         1waybit  ╱
      *                                                 ╱
      *     [   ∙ ·  ·   ·    ·     ·         ·     2target             ]
      *        ╱       │                                2target content
      *       ╱        │                        3waybit
      *      ╱         │                            3waybit content
      *     ╱   ∙ ·  · │ ·    ·             ·   4target
      *   edge         │                            4target content
      *   mark       target
      *               line
      *
      * </pre><p>On the pointer (↖) crossing any DOM-formal part of the start tag,
      * which includes the target liner, the target icon reveals itself in full:</p><pre>
      *
      *                                         1waybit
      *
      *         ∙ ·  ·   ·    ·     ·         ◉     2target
      *                      ↖                          2target content
      *                                         3waybit
      *                                             3waybit content
      *         ∙ ·  ·   ·    ·             ·   4target
      *                                             4target content
      * </pre>
      */
    const Marginalia = ( function()
    {

        const that = {}; // the public interface of Marginalia



        /** Lays or re-lays the given marginalis.
          *
          *     @param marginalis (Element)
          *     @param tagVpBounds (DOMRectReadOnly) The bounds within the scroller's viewport
          *       of the parent start tag.  If undefined, then this parameter is determined anew.
          */
        function lay( marginalis, tagVpBounds = marginalis.parentNode.getBoundingClientRect() )
        {
            let s; // style

          // Span the left margin from page edge to tag
          // --------------------
            const width = tagVpBounds.left + window.scrollX;
            s = marginalis.style;
            s.setProperty( 'left', -width + 'px' );
            s.setProperty( 'width', width + 'px' );

          // Clamp down on the icon (child)
          // ----------------------
            const iconVpBounds = marginalis.lastChild/*icon*/.getBoundingClientRect();
            const height = iconVpBounds.height;
            if( !height ) throw 'Target icon is unlaid';

            s.setProperty( 'height', height + 'px' );

          // Lay the liner (child)
          // -------------
            const liner = marginalis.firstChild;
            s = liner.style;
            const iconX = width - iconVpBounds.width;
            const availableGap/*liner ↔ icon*/ = iconX - TargetLining.MIN_WIDTH;
            if( MIN_GAP - availableGap > GRAPHICAL_ERROR_MARGIN )
            {
                console.error( 'Marginalis availableGap ' + availableGap + ' < MIN_GAP ' + MIN_GAP );
                s.setProperty( 'display', 'none' );
                return;
            }

            const gap = availableGap > MAX_GAP? MAX_GAP: availableGap;
              // allowing it to expand up to MAX_GAP, if that much is available
            const lineWidth = iconX - gap;
            s.setProperty( 'width', lineWidth + 'px' ); // [HSP]
            s.setProperty( 'height',   height + 'px' );
         // liner.setAttribute( 'width', lineWidth );
         // liner.setAttribute( 'height',   height );
         /// a failed attempt to fix the liner.getBBox failure in TargetLining, q.v.
            s.setProperty( 'display', UNSET_STYLE ); // to whatever it was
            TargetLining.redraw( liner, lineWidth, height );
        }



        /** The maximum, formal gap between the liner child and the icon to its right.
          * The *visual* gap may be wider depending on how the liner draws its content.
          */
        const MAX_GAP = 1.5/*rem*/ * REM; // Within which the pointer style defaults, so indicating
                                         // that the two components have distinct control functions.


        /** The minimum, formal gap between the liner child and the icon to its right.
          */
        const MIN_GAP_REM = 0.6; // Changing? sync'd → readable.css

        const MIN_GAP = MIN_GAP_REM * REM;



       // - P u b l i c --------------------------------------------------------------------------------


        /** Ensures the given marginalis will be laid and shown.
          *
          *     @param marginalis (HTMLElement)
          *     @param eSTag (Element) The start tag beside which to lay it.
          */
        that.layWhen = function( marginalis, eSTag )
        {
         // window.requestAnimationFrame( layIf ); // Delaying the first poll of tagVpBounds, no hurry.
            window.setTimeout( layIf, 50/*ms*/ ); // Give the browser a breather.
            let pollCount = 0;
            function layIf( _msTime/*ignored*/ )
            {
                const tagVpBounds = eSTag.getBoundingClientRect();
                if( tagVpBounds.width ) // then the tag is laid
                {
                  // Lay the marginalis and show it
                  // ------------------------------
                    lay( marginalis, tagVpBounds );
                    marginalis.style.setProperty( 'visibility', 'visible' ); // overriding readable.css

                  // Ensure it re-lays itself as needed
                  // ------------------------
                    window.addEventListener( 'resize', (e)=>{lay(marginalis);} );
                }
                else if( pollCount <= 3 )
                {
                    ++pollCount;
                    window.requestAnimationFrame( layIf ); // wait for the tag to get laid
                }
                else console.error( "Cannot lay marginalis, start tag isn't being laid" );
            }
        };



       // - - -

        return that;

    }() );



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
                          // seeking the target nodes in *that* document [OWR]
                        tt: for( traversal.nextNode()/*onto the document node itself*/;; )
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
                            tsk( 'Broken link: No matching *lid* in that document: ' + a2s('link',linkV) );
                            setTargetPreview( s, BREAK_SYMBOL );
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


    /** The control of self hyperlinking and scene switching for waylink target nodes.
      */
    const TargetControl = ( function()
    {

        const that = {}; // the public interface of TargetControl



        /** @param event (MouseEvent) A click event from within the start tag.
          */
        function hearClick( event )
        {
            const eSTag = event.currentTarget; // where listening
            const eClicked = event.target;    // what got clicked

          // Empty container space clicked?  no function
          // ---------------------
            const eClickedNS = eClicked.namespaceURI;
            if( eClickedNS == NS_HTML ) // marginalis
            {
                console.assert( eClicked.parentNode == eSTag && eClicked.localName == 'div', A );
                return;
            }

            if( eClicked == eSTag ) return;

          // Target liner clicked?  function is scene switching
          // ------------
            const targetNode = eSTag.parentNode; // *waylink* target node
            if( eClickedNS == NS_SVG ) // target liner
            {
                if( targetNode != nodeTargeted ) return; // switch is disabled

                const wloc = window.location; // [WDL]
                const u = new URL( wloc.toString() );
                u.hash = ''; // remove the fragment
                const pp = u.searchParams;
                pp.set( 'sc', 'inter' );
                pp.set( 'link', targetNode.getAttributeNS(NS_COG,'lid') );
                const h = window.history;
             // h.replaceState( /*same*/h.state, /*same*/document.title, u.href ); // TEST
                return;
            }

          // Icon or tag name clicked: Function is self hyperlinking
          // ----------------
            const view = document.scrollingElement; // within the viewport
            const scrollTopWas = view.scrollTop;
            const scrollLeftWas = view.scrollLeft;

          // toggle the browser location, targeted ⇄ untargeted
          // - - - - - - - - - - - - - -
            const wloc = window.location; // [WDL]
            if( targetNode == nodeTargeted ) // then transit targeted → untargeted
            {
                wloc.hash = ''; // navigating to the untargeted location, no URI fragment in address bar
                const loc = wloc.toString();
                if( loc.endsWith( '#' )) // Then it left the fragment delimiter hanging there, visible,
                {                 // like the grin of the Cheshire Cat (Firefox, Chrome).  Remove it:
                    const h = window.history;
                    h.replaceState( /*same*/h.state, /*same*/document.title, loc.slice(0,-1) );
                }
            }
            else wloc.hash = targetNode.getAttribute( 'id' ); // untargeted → targeted

          // stabilize the view within the viewport
          // - - - - - - - - - -
            view.scrollTop = scrollTopWas;
            view.scrollLeft = scrollLeftWas;
        }



        /** The *eQName* element that was assigned a special *id* attribute for styling purposes,
          * or null if there is none.
          */
        let hearMouse_eQNameIdentified = null; /* This approach to styling is a workaround for the
          problem that *style* attributes are unsupported for NS_REND elements, such as *eQName*. */


            /** @param event (MouseEvent) A mouse event from the target icon.
              * @return The corresponding *eQName* element.
              */
            function hearMouse_eQName( event )
            {
                const icon = event.currentTarget; // where listening
                return asElementNamed( 'eQName', icon.parentNode/*marginalis*/.previousSibling );
            }


            function hearMouse_unidentify( eQName )
            {
                eQName.removeAttribute( 'id' );
                hearMouse_eQNameIdentified = null;
            }


            /** @param event (MouseEvent) A 'mouseenter' event from the target icon.
              */
            function hearMouseEnter( event )
            {
                if( hearMouse_eQNameIdentified ) hearMouse_unidentify( hearMouse_eQNameIdentified );
                  // preclude duplication, to be sure
                const eQName = hearMouse_eQName( event );
                eQName.setAttribute( 'id', '_wayic.read.TargetControl.iconHover' );
                hearMouse_eQNameIdentified = eQName;
            }


            /** @param event (MouseEvent) A 'mouseleave' event from the target icon.
              */
            function hearMouseLeave( event ) { hearMouse_unidentify( hearMouse_eQName( event )); }



        /** The *id* that is hyperlink-targeted by the browser.
          * Returns the fragment part of window.location without the preceding delimiter character '#',
          * or null if the fragment part is missing.  Caches the return value in *idTargetedC*.
          */
        function idTargeted()
        {
            const hash = window.location.hash; // [WDL]
            idTargetedC = hash.length == 0? null: hash.slice(1);
            return idTargetedC;
        }



        /** Cache of the last value returned from *idTargeted*.
          */
        let idTargetedC; { idTargeted(); }



        /** The waylink target node that is hyperlink-targeted by the browser, or null if there is none.
          *
          *     @see #idTargeted
          */
        let nodeTargeted = null;



       // - P u b l i c --------------------------------------------------------------------------------


        /** Adds controls to the given target node.
          *
          *     @param idV (string) The value of the target node's *id* attribute.
          */
        that.addControls = function( target, eSTag, idV )
        {
            eSTag.addEventListener( 'click', hearClick );
            if( idV == idTargetedC ) nodeTargeted = target;

          // Do hover styling where readable.css cannot [GSC]
          // ----------------
            const icon = asElementNamed( 'icon', eSTag.lastChild/*marginalis*/.lastChild );
            icon.addEventListener( 'mouseenter', hearMouseEnter );
            icon.addEventListener( 'mouseleave', hearMouseLeave );
        };



       // - - -

        window.addEventListener( 'hashchange', function( _event/*ignored*/ )
        {
            const id = idTargeted();
            if( !id )
            {
                nodeTargeted = null;
                return;
            }

            const t = getTargetById( id );
            nodeTargeted = t? t: null;
        });

        return that;

    }() );



   // ==================================================================================================


    /** Dealing with target liners.  A target liner is a marginalis component that draws vector graphics
      * for a waylink target node, and controls the scene switching for it.<pre>
      *
      *              target line
      *     ● ━━━━━━━━━━━━━━━━━━━━━━━━━━━
      *      ╲
      *      edge
      *      mark
      *
      * </pre>
      *
      *     @see Marginalia
      */
    const TargetLining = ( function()
    {

        const that = {}; // the public interface of TargetLining

        // Dimensions and coordinates are given in pixels, except where marked otherwise.



        /** The gap between the edge mark and the line to its right.
          */
        const GAP = 2/*rem*/ * REM;



        const EDGE_MARK_WIDTH = 0.3/*rem*/ * REM;

        const EDGE_MARK_RADIUS = EDGE_MARK_WIDTH / 2;



        const LINE_MIN_LENGTH = GAP;



        const MIN_CLICK_WIDTH_REM = 0.8; // Changing? sync'd → readable.css



       // - P u b l i c --------------------------------------------------------------------------------


        /** The minimum width that a liner requires in order to draw itself.
          */
        that.MIN_WIDTH = MIN_CLICK_WIDTH_REM * REM;

            { console.assert( EDGE_MARK_WIDTH - that.MIN_WIDTH <= GRAPHICAL_ERROR_MARGIN, A ); }



        /** Constructs a target liner.
          */
        that.newLiner = function()
        {
            const liner = document.createElementNS( NS_SVG, 'svg' );
         // liner.addEventListener( 'resize', (e)=>{that.redraw(liner);} );
              // Ensuring it draws when first laid, then redraws as needed.
              //
              // Except it's not called.  Likewise for event name 'SVGResize' and attribute *onresize*.
              // Maybe embedded svg elements such as this are not considered "outermost svg elements"?
              // https://www.w3.org/TR/SVG11/interact.html#SVGEvents
              //
              // As a workaround, the Marginalis layout calls *redraw* directly.
            liner.appendChild( document.createElementNS( NS_SVG, 'circle' )); // edge mark
            liner.appendChild( document.createElementNS( NS_SVG, 'path' ));  // line
            return liner;
        };



        /** Draws or redraws the given liner.
          *
          *     @param liner (SVGSVGElement)
          */
        that.redraw = function( liner, width, height )
        {
         // const bounds = liner.getBBox(); /* The actual bounds within the larger document.
         //   These define the coordinate system of the drawing because the liner (*svg* element)
         //   declares no *viewBox*.  Therefore the default unit (SVG 'user unit') is pixels. */
         // const width = bounds.width;
         // const height = bounds.height;
         /// that failed, now they're given as parameters instead

          // Draw the line
          // -------------
            const midY = height / 2; // vertically centered
            {
                const line = asElementNamed( 'path', liner.lastChild );
                const endX = width - width / 4;
                let display;
                if( endX - GAP >= LINE_MIN_LENGTH )
                {
                    line.setAttribute( 'd',
                      // [PD]     X             Y
                      //        ------         ----
                         'M ' + GAP + ' ' + midY
                      + ' H ' + endX
                      );
                    display = UNSET_STYLE; // to whatever it was
                }
                else display = 'none'; // too short
                line.style.setProperty( 'display', display );
            }

          // Draw the edge mark
          // ------------------
            const mark = asElementNamed( 'circle', liner.firstChild );
            mark.setAttribute(  'r', EDGE_MARK_RADIUS + 'px' );
            mark.setAttribute( 'cx', EDGE_MARK_RADIUS + 'px' ); // abutting the document edge
            mark.setAttribute( 'cy', midY + 'px' );
        };



       // - - -

        return that;

    }() );



   // ==================================================================================================


    /** A device for tracing the way across multiple waylinked documents.  It traces the root element's
      * waylinks to their target nodes, thence onward till it traces the full network of waylinks.
      * The trace serves two purposes: (1) to discover documents for omnireaders; and (2) to adjust the
      * rendering of the present document based on the results.
      *
      *     @see http://reluk.ca/project/wayic/cast/root#root_element
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



        /** Constructs a trace leg identifier (string) for the specified target.
          * Each trace leg is scoped to single DOM branch exclusive of waylinks.
          *
          *     @param tDocLoc (string) The target document location in normal URL form.
          *     @param targetID (string)
          */
        function newLegID( tDocLoc, targetID ) { return tDocLoc + '#' + targetID; }



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



        /** The location of the root document (string) in normal URL form.
          *
          *     @see http://reluk.ca/project/wayic/cast/root#root_document
          *     @see URIs#normalized
          */
        const ROOT_DOCUMENT_LOCATION = CAST_BASE_LOCATION + 'way.xht';



        /** The identifier of the root leg of the trace.
          *
          *     @see http://reluk.ca/project/wayic/cast/root#root_element
          */
        const ROOT_LEG_ID = newLegID( ROOT_DOCUMENT_LOCATION, 'root' );



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
            let t = branch;
            const traversal = doc.createTreeWalker( t, SHOW_ELEMENT );
            do
            {
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
                                        tsk( 'Malformed document: Missing HTML *body* element: ' + tDocLoc );
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
                         // window.setTimeout( this.readDirectly, /*delay*/0, tDocReg, tDoc );
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
            while( (t = traversal.nextNode()) != null );
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
        that.start = function() // requires TARGID for the *present* document in case it gets traced
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
                    const target = doc.getElementById( 'root', doc ); // assumes TARGID
                    if( target ) traceLeg( id, target, docReg );
                    else tsk( 'Unable to trace: Missing root waybit: ' + id );
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
  *  [BA] · Boolean attribute.  A boolean attribute such as [rend:isFoo] either has the same value
  *         as the local part of its name (‘isFoo’), which makes it true, or it is absent
  *         and thereby false.
  *
  *  [C2] · The constructor of PartRenderingC2 must remove all such markup.
  *
  *  [GSC]  General sibling combinator, as per readable.css.
  *
  *  [HSP]  HTML-embedded styling property, as per readable.css.
  *
  *  [NPR]  Network-path reference.  https://tools.ietf.org/html/rfc3986#section-4.2
  *
  *  [NNR]  Not NS_REND.  Here avoiding renderer-specific elements in favour of standard HTML.
  *         This is for sake of properties such as the *style* attribute which are unsupported
  *         for NS_REND elements.
  *
  *  [ODO]  Out of display order.  This element which is not always present (variant) is declared out of
  *         display order so not to interfere with the *declaration* order of its invariant siblings.
  *         Normally it would be declared earlier, but that would complicate the lookup of its siblings,
  *         making them harder to find.
  *
  *  [OWR]  The OuterWaylinkResolver might run marginally faster if (instead) it began the traversal
  *         with the source nodes and sought the target of each using (new) Documents.getTargetById.
  *
  *  [PD] · Path data.  It could instead be defined using the new SVGPathData interface, but this
  *         (array-form instead of string-form definition) wouldn’t help enough to outweigh the bother
  *         of using a polyfill.  https://github.com/jarek-foksa/path-data-polyfill.js
  *
  *  [WDL]  ‘window.location’ or ‘document.location’?  One may use either, they are identical.
  *         https://www.w3.org/TR/html5/browsers.html#the-location-interface
  *
  *  [XN] · XML names.  https://www.w3.org/TR/xml-names/
  */


// Copyright © 2017-2018 Michael Allan and contributors.  Licence MIT.
