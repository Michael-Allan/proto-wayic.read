/** readable - Way declaration documents that are readable on the web
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
  *   The renderer introduces its own markup to the document as outlined in this section.
  *   Key to the outline:
  *
  *          * blah          · Element ‘blah’ in namespace NS_REND, the default in this notation †
  *          * foo:bar        · Element ‘bar’ in namespace NS_*FOO*
  *              * [attrib]    · Attribute of the element in namespace NS_REND †
  *              * [:attrib]    · Attribute of the element in no namespace
  *              * [foo:attrib] · Attribute of the element in namespace NS_*FOO*
  *              * foo:baz      · Child element ‘baz’
  *
  *                                            † Unless otherwise marked, the namespace
  *                                              of an element or attribute is NS_REND.
  *   Element, any
  *   - - - -
  *      * [isOnWayBranch] · Whether this element is (with all of its descendants) on way  [BA]
  *
  *   html:html
  *   - - - - -
  *      * [lighting] · Either ‘paper’ for black on white effects, or ‘neon’ for the reverse
  *      * [travel]   · Extent of travel in the history stack to reach the present entry: -N, 0, or N
  *                     (backward by N entries, reload, or forward by N entries).  In other words,
  *                     the relative position of this entry versus the last (of ours) that was shown.
  *
  *   html:body
  *   - - - - -
  *      * scene      · Document scene
  *          * [:id]   · ‘data:,wayic.read.document_scene’
  *      * scene        · Interlink scene(s), if any
  *          * [:class] · ‘interlink’
  *        scene
  *          ⋮
  *
  *      * offWayScreen · Overlay screen for off-way styling, q.v. in readable.css.
  *
  *   html:a
  *   - - - -
  *      * [showsBreadcrumb] · Holds the breadcrumb for this history entry and prominently shows it?
  *                            Set after travelling back in history onto this hyperlink source node,
  *                            it reorients the user by highlighting his original point of departure.
  *                            Appears at most on one element.  [BA, FIB, SBU]
  *
  *   a  (rend:a - waylink source node, hyperform)
  *   -
  *      * html:a               · (§ q.v.)
  *          * [cog:link]        ·
  *          * [targetDirection] · Direction to the target node (‘up’ or ‘down’) if the waylink
  *                                is an intradocument waylink and its target node exists
  *      * html:sup   · Hyperlink indicator, containing ‘*’, ‘†’ or ‘‡’
  *
  *   Wayscript element, any
  *   - - - - - - - - -
  *      * [hasLeader]      · Has leading, non-whitespace text?  [BA]
  *      * [hasShortName]    · Has a rendered name no longer than three characters?
  *      * [isComposer]        · Is a composer element?  [BA]
  *      * [isOrphan]           · Is waylink targetable, yet targeted by no source node?
  *      * [isWaybit]            · Is a waybit?
  *      * [isWaylinkTargetable] · Iff this attribute is absent, then the answer is ‘no’; else its value
  *                                is either ‘targeted’ or ‘untargeted’.  [readable.css TPC]
  *      * [isWayscript]        · Is under a ‘data:,wayscript.’ namespace?
  *
  *      * eSTag       · Start tag of an element, reproducing content that would otherwise be invisible
  *                      except in the wayscript source
  *          * eQName            · Qualified name [XN] of the element
  *              * [isAnonymous]    · Has a local part that is declared to be anonymous?  [BA]
  *              * ePrefix           · Namespace prefix, if any
  *                  * [isAnonymous] · Has a prefix that is declared to be anonymous?
  *              * eName             · Local part of the name
  *          * html:div             · Marginalis (if element is a waylink target node).  [NNR, ODO]
  *              * svg:svg        · Target liner
  *                 * svg:path   · Line
  *                 * svg:circle · Edge mark
  *              * icon          ·
  *
  *      * textAligner · (if element is a step)
  *
  *   Waylink source node, bitform
  *   - - - - - - - - - -
  *      * [hasPreviewString] · Has a non-empty preview of the target text?  [BA]
  *      * [image]            · Indicates a rendering that might yet change.  Meantime the rendering
  *                             is either based on a cached image of the target node (value ‘present’)
  *                             or not (‘absent’)
  *      * [isBroken]     · Has a broken target reference?  [BA]
  *      * [cog:link]    ·
  *
  *      * eSTag                  · (q.v. under § Wayscript element)
  *      * textAligner             · (if element is a step)
  *      * forelinker               · Hyperlink effector
  *          * html:a                · (§ q.v.)
  *              * [targetDirection] · (q.v. under § a § html:a)
  *              * preview           · Preview of the target text
  *              * html:br           ·
  *              * verticalTruncator · Indicating the source node as such (half a link)
  *                  * html:span     · Containing the visible indicator, exclusive of padding
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



    /** The history entry state for the present load of the document, as captured at load time;
      * prior to any modification of the entry itself, and prior to any extension of the history stack
      * owing to the addition of a new entry by intradocument travel.
      */
    const loadTimeHistoryState = history.state;



    /** The XML namespace of markup specific to this project.
      */
    const NS_REND = 'data:,wayic.read';



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



    /** The XML namespace of HTML.
      */
    const NS_HTML = 'http://www.w3.org/1999/xhtml';



   // ==================================================================================================


    /** Dealing with Uniform Resource Identifiers.
      *
      *     @see https://tools.ietf.org/html/rfc3986
      */
    const URIs = ( function()
    {

        const that = {}; // The public interface of URIs



        const hrefParserDiv = document.createElementNS( NS_HTML, 'div' );

          hrefParserDiv.innerHTML = '<a/>';



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
            return toEnforceCostlyConstraints && uri !== that.normalized(uri)
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
            div.firstChild.href = ref; // Escaping ref en passant
            div.innerHTML = div.innerHTML; // Reparsing it
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



    /** Transforms an attribute declaration to a string.
      */
    function a2s( name, value ) { return name + "='" + value + "'"; }



    /** The message prefix for console assertions.
      */
    const AA = A + ': ';



    /** Returns the given node if it looks like an element and has the right name,
      * otherwise returns null.
      *
      *     @param name (string) The expected value of the *localName* property.
      *     @param node (Node)
      */
    function asElementNamed( name, node ) { return name === node.localName? node: null; }



    const BREAK_SYMBOL = '\u{1f5d9}'; // Unicode 1f5d9 (cancellation X).  Changing? sync'd → readable.css.



    /** The location of the waycast (string) in normal URL form, and with a trailing slash '/'.
      *
      *     @see URIs#normalized
      */
    let CAST_BASE_LOCATION; // Init below, thence constant



    /** The nominal location of the waycast (string) in the form of a URI reference without a trailing
      * slash '/'.  Minimally it is formed as either an empty string '' (absolute reference),
      * or a single dot '.' (relative), such that appending a slash always yield a valid reference.
      * Otherwise it is taken directly from the waycast reference in the *src* attribute
      * of the *script* element that loads the waycaster's personal configuration script.
      *
      *     @see Personalized configuration, http://reluk.ca/project/wayic/cast/doc.task
      */
    const CAST_BASE_REF = ( ()=>
    {
        const configFileName = 'way.js';
        const traversal = document.createTreeWalker( document.body, SHOW_ELEMENT );
        for( let t = traversal.lastChild(); t !== null; t = traversal.previousSibling() )
        {
            if( t.localName === 'script' && t.namespaceURI === NS_HTML )
            {
                let r = t.getAttribute( 'src' );
                if( r && r.endsWith(configFileName) )
                {
                    let rN = r.length - configFileName.length;
                    if( rN === 0 ) return '.';

                    --rN;
                    if( r.charAt(rN) === '/' ) return r.slice( 0, rN ); // r without the trailing slash
                }
            }
        }

        tsk( 'Missing ' + configFileName + ' *script* element in document *body*' );
        return '__UNDEFINED_waycast_base__';
    })();



        {
            let loc = URIs.normalized( CAST_BASE_REF );
            if( !loc.endsWith('/') ) loc = loc + '/';
            CAST_BASE_LOCATION = loc;
        }



    const COMMENT = Node.COMMENT_NODE;



    /** Configures a bitform waylink source node for a given target node.
      *
      *     @param sourceNS (string) The namespace of the source node.
      *     @param sourceN (string) The local part of the source node's name.
      *     @param linkV (string) The value of the source node's *link* attribute.
      *     @param isBit (boolean) Whether the source node is a waybit.
      *     @param target (Element | TargetImage) The target node, or its cached image.
      *     @param rendering (PartRenderingC)
      */
    function configureForTarget( sourceNS, sourceN, linkV, isBit, target, rendering )
    {
        const targetNS = target.namespaceURI;
        const targetN = target.localName;
        let isMalNameReported = false;
        if( sourceNS !== targetNS )
        {
            tsk( 'Source node namespace (' + sourceNS + ') differs from target node namespace ('
              + targetNS + ') for waylink: ' + a2s('link',linkV) );
            isMalNameReported = true;
        }
        if( !isMalNameReported && !isBit && sourceN !== targetN )
        {
            tsk( 'Source node name (' + sourceN + ') differs from target node name (' + targetN
              + ') for waylink: ' + a2s('link',linkV) );
        }
        if( isBit && sourceN === ELEMENT_NAME_UNCHANGED )
        {
            rendering.localPartOverride = targetN; // Rendering with the same name as the target
        }
    }



    /** Configures a bitform waylink source node for a given target preview.
      *
      *     @param source (Element) The source node.
      *     @param preview (Element) Its *preview* element.
      */
    function configureForTargetPreview( source, preview, previewString )
    {
        const pointCount = countCodePoints( previewString );
        if( pointCount === 0 )
        {
            source.removeAttributeNS( NS_REND, 'hasPreviewString' );
            preview.classList.remove( 'singleCharacterContent' ); // If present
        }
        else
        {
            source.setAttributeNS( NS_REND, 'hasPreviewString', 'hasPreviewString' );
            preview.classList.toggle( 'singleCharacterContent', pointCount === 1 ); // [AEP]
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
        let loc = location.toString(); // [WDL]
        if( location.hash ) loc = URIs.defragmented( loc );
        return URIs.normalized( loc ); // To be sure
    })();



    const DOCUMENT_POSITION_FOLLOWING = Node.DOCUMENT_POSITION_FOLLOWING;
    const DOCUMENT_POSITION_PRECEDING = Node.DOCUMENT_POSITION_PRECEDING;



    const DOCUMENT_SCENE_ID = NS_REND + '.document_scene';



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



    /** The allowance for rounding errors and other imprecisions in graphics rendering.
      */
    const GRAPHICAL_ERROR_MARGIN = 0.01;



    /** The symbol to indicate a hyperlink.  It is rendered in superscript.
      */
    const HYPERLINK_SYMBOL = '*'; // '*' is Unicode 2a (asterisk)

    const HYPERLINK_SYMBOLS = [HYPERLINK_SYMBOL, '†', '‡']; /* '†' is Unicode 2020 (dagger);
      '‡' 2021 (double dagger).  Avoiding '⁑' 2051 (two asterisks) as fonts render it poorly. */



    /** Answers whether *ns* is a namespace of waybits.  That means either NS_BIT itself
      * or another namespace that starts with NS_BIT and a dot separator.
      * The only other defined at present is NS_STEP.
      *
      *     @param ns (string)
      */
    function isBitNS( ns )
    {
        const nsBitLen = NS_BIT.length;
        return ns.startsWith(NS_BIT) && (ns.length === nsBitLen || ns.charAt(nsBitLen) === '.');
    }



    /** Answers whether *subNS* is a subnamespace of waybits.  That means either 'bit' itself
      * or another subnamespace that starts with 'bit.'.
      *
      *     @param subNS (string) A wayscript namespace without the leading NS_WAYSCRIPT_DOT.
      */
    function isBitSubNS( subNS )
    {
        return subNS.startsWith(SUB_NS_BIT) && (subNS.length === 3 || subNS.charAt(3) === '.');
    }



    /** Returns the last descendant of the given node, or null if the node is empty.
      *
      *     @see #toLastDescendant
      */
    function lastDescendant( node )
    {
        do node = node.lastChild;
        while( node.hasChildNodes() );
        return node;
    }



    /** Answers whether this load of the document has extended the history stack, breaking new ground
      * there by adding at least one new entry.  (Multiple entries may be added by a single load
      * owing to intradocument travel.)  A reload never breaks new ground.
      */
    const LOAD_BREAKS_GROUND = loadTimeHistoryState === null
      || loadTimeHistoryState.breadcrumbPath === undefined;



    const MALFORMED_PARAMETER = 'Malformed parameter';



    const NO_BREAK_SPACE = ' '; // Unicode a0



    /** The XML namespace of waybits simply, excluding subspaced waybits such as steps.
      */
    const NS_BIT  = NS_WAYSCRIPT_DOT + SUB_NS_BIT;



    /** The XML namespace of markup specific to cogs.
      */
    const NS_COG  = NS_WAYSCRIPT_DOT + SUB_NS_COG;



    /** The XML namespace of steps.
      */
    const NS_STEP = NS_WAYSCRIPT_DOT + SUB_NS_STEP;



    /** The XML namespace of SVG.
      */
    const NS_SVG = 'http://www.w3.org/2000/svg';



    const NULL_PARAMETER = 'Null parameter';



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
          // Credit Noseratio, https://stackoverflow.com/a/18916788/2402790

      // Gross form
      // ----------
        transform();

      // Document shown, view stable in the typical case [TIC]
      // --------------
        showDocument();
        if( LOAD_BREAKS_GROUND ) ViewPortage.ensureTargetShows();

      // Processes launched, view may deflect in atypical cases
      // ------------------
        InterdocScanner.start();
        InterdocWaylinkRenderer.start();
        WayTracer.start();
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
        let defaultTextColour = getComputedStyle(body).getPropertyValue( 'color' );
          // Using 'color' here because somehow 'background-color' fails;
          // it reads as transparent (Firefox) or black (Chrome), when really it's white.
        const cc = defaultTextColour.match( /^\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/ );
        if( cc !== null )
        {
            const red = cc[1], green = cc[2], blue = cc[3]; // Each 0-255
            const luma = red * 299 + green * 587 + blue * 114; // 0-255,000, perceived brightness
              // formula: https://en.wikipedia.org/wiki/YIQ
            lighting = luma < 127500? 'paper':'neon';
        }
        else lighting = 'paper'; // Defaulting to what's most popular

      // Set lighting switch
      // -------------------
        document.documentElement.setAttributeNS( NS_REND, 'lighting', lighting );

      // Show document
      // -------------
        body.style.setProperty( 'display', 'block' ); // Overriding readable.css 'none'
    }



    const TEXT = Node.TEXT_NODE;



    /** Moves the given tree walker to the last visible descendant of the current node.
      *
      *     @see #lastDescendant
      *     @see Document Object Model traversal § Visibility of nodes,
      *       https://www.w3.org/TR/DOM-Level-2-Traversal-Range/traversal.html#Iterator-Visibility-h4
      */
    function toLastDescendant( treeWalker ) { while( treeWalker.lastChild() ) {} }



    /** Tranforms the present document.
      */
    function transform()
    {
        const body = document.body;
        const scene = body.appendChild( document.createElementNS( NS_REND, 'scene' ));
        scene.setAttribute( 'id', DOCUMENT_SCENE_ID );
        for( ;; ) // Wrap *body* content in *scene*
        {
            const c = body.firstChild;
            if( c === scene ) break;

            scene.appendChild( c );
        }
        const traversal = document.createTreeWalker( scene, SHOW_ELEMENT, {
            acceptNode: function( node )
            {
                if( node.namespaceURI === NS_REND ) return NodeFilter.FILTER_REJECT; /* Bypassing this
                  branch which was introduced in an earlier iteration and needs no more transforming. */

                return NodeFilter.FILTER_ACCEPT;
            }
        });
        let layoutBlock = traversal.currentNode; /* Tracking the nearest container element in the
          current hierarchy path (current element or nearest ancestor) that has a block layout. */
        let layoutBlock_aLast = null; // Layout block of the most recent (author's) hyperlink
        let layoutBlock_aCount = 0; // Count of such hyperlinks in that block, so far
        tt: for( ;; )
        {
            const t = traversal.nextNode(); // Maintaining *t* as the current element of the traversal
            if( t === null ) break;


          // ============
          // General form of element t
          // ============
            const tNS = t.namespaceURI;
            const tN = t.localName;
            let isBit, isHTML, isWayscript;
            let tSubNS; // Wayscript subnamespace, or null if element t is not wayscript
            if( tNS.startsWith( NS_WAYSCRIPT_DOT )) // Then element t is wayscript
            {
                isHTML = false;
                isWayscript = true;
                t.setAttributeNS( NS_REND, 'isWayscript', 'isWayscript' );
                tSubNS = tNS.slice( NS_WAYSCRIPT_DOT_LENGTH );
                isBit = isBitSubNS( tSubNS );
                layoutBlock = t; // Sync'd ← readable.css § Wayscript
            }
            else // Element t is non-wayscript
            {
                isHTML = tNS === NS_HTML;
                isBit = isWayscript = false;
                tSubNS = null;
                if( !getComputedStyle(t).getPropertyValue('display').startsWith('inline') )
                {
                    layoutBlock = t;
                }
            }


          // =================
          // Hyperform linkage by element t
          // =================
            hyperform: if( isHTML && tN === 'a' )
            {
                const href = t.getAttribute( 'href' );
                const linkV = t.getAttributeNS( NS_COG, 'link' );
                let targetExtradocLocN; // Or empty string, as per TargetWhereabouts.documentLocationN
                if( href !== null ) // Then t is a generic hyperlink
                {
                    if( linkV !== null )
                    {
                        tsk( 'An *a* element with both *href* and *link* attributes: '
                          + a2s('href',href) + ', ' + a2s('link',link) );
                    }
                    if( href.startsWith( '/' )) t.setAttribute( 'href', CAST_BASE_REF + href );
                      // Translating waycast space → universal space
                    const docLocN = URIs.defragmented( URIs.normalized( href ));
                    targetExtradocLocN = docLocN === DOCUMENT_LOCATION? '': docLocN;
                }
                else if( linkV !== null ) // Then t is a hyperform waylink
                {
                    let link;
                    try { link = new LinkAttribute( linkV ); }
                    catch( unparseable )
                    {
                        tsk( unparseable );
                        break hyperform;
                    }

                    link.hrefTo( t );
                    const targetWhereabouts = new TargetWhereabouts( t, link );
                    targetExtradocLocN = targetWhereabouts.documentLocationN;
                    const direction = targetWhereabouts.direction;
                    if( direction !== null ) t.setAttributeNS( NS_REND, 'targetDirection', direction );
                }
                if( targetExtradocLocN.endsWith( '/way.xht' )) // Likely a way declaration document.
                {                                             // So tell the renderer:
                    InterdocWaylinkRenderer.noteTargetDocument( targetExtradocLocN );
                }

              // Superscripting
              // --------------
                const aWrapper = document.createElementNS( NS_REND, 'a' );
                t.parentNode.insertBefore( aWrapper, t );
                aWrapper.appendChild( t );
                const sup = aWrapper.appendChild( document.createElementNS( NS_HTML, 'sup' ));
                const symbol = ( ()=>
                {
                    if( layoutBlock !== layoutBlock_aLast ) // Then t is the 1st hyperlink in this block
                    {
                        layoutBlock_aLast = layoutBlock;
                        layoutBlock_aCount = 0;
                        return HYPERLINK_SYMBOL;
                    }

                    const count = ++layoutBlock_aCount; // t is a *subsequent* hyperlink in this block
                    return HYPERLINK_SYMBOLS[count % HYPERLINK_SYMBOLS.length]; // Next in rotation
                })();
                sup.appendChild( document.createTextNode( symbol ));
            }

            if( !isWayscript ) continue tt;


          ///////////////////////////////////////////////////////////////////////////////////  WAYSCRIPT

            const isDeclaredEmpty = !t.hasChildNodes();
            if( tSubNS === SUB_NS_STEP )
            {
                const textAligner = document.createElementNS( NS_REND, 'textAligner' );
                t.insertBefore( textAligner, t.firstChild );
            }
            if( isBit ) t.setAttributeNS( NS_REND, 'isWaybit', 'isWaybit' );
            const partRendering = new PartRenderingC( t );


          // ==================
          // Bitform waylinkage of element t
          // ==================
            const lidV = ( ()=> // Target identifier, non-null if t is a potential waylink target node
            {
                if( !isBit ) return null;

                const v = t.getAttribute( 'id' );
                if( v && Documents.testIdForm(t,v) ) return v;

                return null;
            })();
            const linkV = ( ()=> // Waylink declaration, non-null if t is a source node
            {
                let v = t.getAttributeNS( NS_COG, 'link' );
                if( v === null ) return null;

                if( !isBit )
                {
                    tsk( 'A non-waybit element with a *link* attribute: ' + a2s('link',v) );
                    v = null;
                }
                return v;
            })();
            source: if( linkV !== null )
            {
                if( lidV !== null )
                {
                    tsk( 'A bitform waylink node with both *id* and *link* attributes: ' + a2s('id',lidV) );
                    break source;
                }

                if( !isDeclaredEmpty )
                {
                    tsk( 'A bitform waylink source node with content: ' + a2s('link',linkV) );
                    break source;
                }

                let link;
                try { link = new LinkAttribute( linkV ); }
                catch( unparseable )
                {
                    tsk( unparseable );
                    break source;
                }

                const forelinker = t.appendChild( document.createElementNS( NS_REND, 'forelinker' ));
                const a = forelinker.appendChild( document.createElementNS( NS_HTML, 'a' ));
                link.hrefTo( a );
                const targetWhereabouts = new TargetWhereabouts( t, link );
                let targetPreviewString;
                targeting:
                {
                    const targetDocLocN = targetWhereabouts.documentLocationN;
                    if( targetDocLocN.length > 0 ) // Then *t* links to a separate document
                    {
                        const registration = InterdocWaylinkRenderer.registerBitformLink( t,
                          targetDocLocN, link.targetID );
                        const image = registration.targetImage;
                        if( image === null )
                        {
                            partRendering.image = 'absent';
                            targetPreviewString = '⌚'; // '⌚' is Unicode 231a (watch) = pending symbol
                        }
                        else
                        {
                            partRendering.image = 'present';
                            targetPreviewString = image.leader;
                            configureForTarget( tNS, tN, linkV, isBit, image, partRendering );
                        }
                        break targeting;
                    }

                    const direction = targetWhereabouts.direction;
                    if( direction === null ) // Then *t* is a broken waylink
                    {
                        targetPreviewString = BREAK_SYMBOL;
                        t.setAttributeNS( NS_REND, 'isBroken', 'isBroken' );
                        break targeting;
                    }

                    // The target is within the present document
                    a.setAttributeNS( NS_REND, 'targetDirection', direction );
                    const target = targetWhereabouts.target;
                    configureForTarget( tNS, tN, linkV, isBit, target, partRendering );
                    LeaderReader.read( target );
                    targetPreviewString = LeaderReader.leader;
                }
                const preview = a.appendChild( document.createElementNS( NS_REND, 'preview' ));
                preview.appendChild( document.createTextNode( targetPreviewString ));
                configureForTargetPreview( t, preview, targetPreviewString );
                a.appendChild( document.createElementNS( NS_HTML, 'br' ));
                a.appendChild( document.createElementNS( NS_REND, 'verticalTruncator' ))
                 .appendChild( document.createElementNS( NS_HTML, 'span' ))
                 .appendChild( document.createTextNode( '⋱⋱' ));
                    // '⋱' is Unicode 22f1 (down right diagonal ellipsis)
            }


         // =========
         // Start tag of element t
         // =========
            partRendering.render();
            const eSTag = partRendering.eSTag;
            if( lidV !== null ) // Then t is waylink targetable
            {
                t.setAttributeNS( NS_REND, 'isWaylinkTargetable',
                  lidV === Hyperlinkage.idTargeted()? 'targeted':'untargeted' );
                t.setAttributeNS( NS_REND, 'isOrphan', 'isOrphan' ); // Till proven otherwise

              // Marginalis
              // ----------
                const marginalis = eSTag.appendChild( document.createElementNS( NS_HTML, 'div' ));
                marginalis.appendChild( TargetLining.newLiner() );
                marginalis.appendChild( document.createElementNS( NS_REND, 'icon' ))
                  .appendChild( document.createTextNode( NO_BREAK_SPACE )); // To be sure
                    // See readable.css for the *visible* content
                Marginalia.layWhen( marginalis, eSTag );

              // -----
                TargetControl.addControls( eSTag );
            }
            else if( tSubNS === SUB_NS_COG
             && (tN === 'comprising' || tN === 'including'))
            {
                t.setAttributeNS( NS_REND, 'isComposer', 'isComposer' );

              // Composition leader alignment  (see readable.css)
              // ----------------------------
                console.assert( LeaderReader.element === t, A );
                alignment: if( LeaderReader.hasLeader )
                {
                    let n = eSTag.nextSibling; /* Whether special alignment is needed depends on the
                      node that follows the start tag. */
                    let type = n.nodeType;
                    function isNonethelessSafeToMove() // Though type ≠ TEXT, an assumption here
                    {
                        return type === COMMENT || type === ELEMENT && n.namespaceURI === NS_HTML;
                    }

                    if( type === TEXT )
                    {
                        const cc = n.data; // Leading characters
                        if( cc.length === 0 )
                        {
                            console.assert( false, A );
                            break alignment;
                        }

                        const c = cc.charAt( 0 );
                        if( c === '\n' || c === '\r' ) break alignment; /* Not in line with start tag,
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
                        if( n === null ) break;

                        type = n.nodeType;
                    } while( type === TEXT || isNonethelessSafeToMove() );
                    n = lastDescendant( eQName ); // Last node of the leader
                    if( n.nodeType === TEXT )
                    {
                        const trailer = n.data;
                        const m = trailer.match( /\s+$/ ); // Trailing whitespace
                        if( m !== null ) n.replaceData( m.index, trailer.length, '' );
                          // Stripping it so that readable.css can neatly append a colon to eQName
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
        if( message === null ) throw NULL_PARAMETER;

        console.error( message );
        if( isUserEditor ) alert( message ); // See readable.css § TROUBLESHOOTING
    }



    /** The empty string as a parameter for CSSStyleDeclaration.setProperty,
      * which instead has the effect of *removeProperty*.
      *
      *     @see https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-setproperty
      */
    const UNSET_STYLE = '';



    /** Answers whether the given HTML element is very likely to be rendered in line by the browser.
      */
    function willDisplayInLine_likely( htmlElement ) // A workaround function for its caller, q.v.
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



    /** Cueing for the purpose of user reorientation after hyperlink back travel.  For this purpose,
      * Breadcrumbs gives to each entry (of ours) in the history stack the following state properties:
      * <ul><li>
      *     breadcrumbPath (string in XPath form) Identifier of the last HTML *a* element
      *                    that was activated within this entry, or null if none was activated </li><li>
      *     position (number) Ordinal of the entry itself within the history stack,
      *              a number from zero (inclusive) to the length of the stack (exclusive) </li></ul>
      */
    const Breadcrumbs = ( function()
    {

        const that = {}; // The public interface of Breadcrumbs



        /** The element (Element) on which attribute *showsBreadcrumb* is set, or null if there is none.
          */
        let crumbHolder = null;



        /** @param element (HTMLAnchorElement)
          * @return (string) An unambiguous identifier of the given element in XPath form.
          */
        function definitePath( element )
        {
            // Modified from Mozilla contributors' *XPath snippets*, licence CC-BY-SA 2.5.
            // https://developer.mozilla.org/en-US/docs/Web/XPath/Snippets#getXPathForElement
            const html = document.documentElement;
            let path = '';
            path: for( let e = element;; e = e.parentNode )
            {
                const eLocalName = e.localName;
                let seg = "/*[local-name()='" + eLocalName + "']"; // Segment of path
                if( e === html )
                {
                    path = seg + path;
                    break path;
                }

                let ordinal = 1; // Ordinals count from 1 in XPath
                for( let sibling = e;; )
                {
                    sibling = sibling.previousElementSibling;
                    if( sibling === null ) break;

                    if( sibling.localName === eLocalName ) ++ordinal;
                }
                seg +=  '[' + ordinal + ']';
                path = seg + path;
            }
            return path;
        }



        function ensureNoCrumbShowing()
        {
            if( crumbHolder === null ) return;

            crumbHolder.removeAttributeNS( NS_REND, 'showsBreadcrumb' );
            crumbHolder = null;
        }



        /** @param click (MouseEvent) A click event from within the document element.
          */
        function hearClick/* event handler */( click )
        {
            let a = null; // Hyperlink source node (HTML *a* element) about to activate, if any
            for( let t = click.target;; t = t.parentNode )
            {
                if( t.namespaceURI !== NS_HTML ) continue;

                const tN = t.localName;
                if( tN === 'body' || tN === 'html' ) break;

                if( tN !== 'a' ) continue;

                if( !t.hasAttribute( 'href' )) break; // Dud link

                a = t;

              // Drop a crumb before traversing the link
              // ------------
                const state = history.state;
                console.assert( state !== null, A ); // Already initialized by Breadcrumbs.reorient
                state.breadcrumbPath = definitePath( a );
                history.replaceState( state, /*no title*/'' );
                break;
            }

            if( crumbHolder === a ) return; // None is showing, or none other than *a*; no problem

            ensureNoCrumbShowing(); /* Either the crumb is no longer present where it is showing
              because it was just removed and dropped on *a* instead; or the click indicates that
              the user no longer wants it to show. */
        }



        const ORDERED_NODE_ITERATOR_TYPE = XPathResult.ORDERED_NODE_ITERATOR_TYPE;



        const KEY_positionLastShown = NS_REND + '.Breadcrumbs.positionLastShown';



        /** Reorient after a position change in the history stack.
          *
          *     @param state (Object) The value of history.state subsequent to the change.
          */
        function reorient( state )
        {
            // Copied in part to https://stackoverflow.com/a/49329267/2402790

            if( state === null ) state = {}; /* Forcing to the worst case wherein the state
              is already set by a foreign agent, such as another program */
            let position = state.position;
            let travel; /* (-N, 0, N) = (backward by N entries, reload, forward by N entries)
              Relative position of this entry versus the last entry (of ours) that was shown */
            if( position === undefined ) // Then this entry is new to the stack
            {
                position = history.length - 1; // Top of stack
                travel = 1;

              // Initialize state properties
              // ---------------------------
                state.breadcrumbPath = null; // Initializing the state in proper form
                state.position = position;
                history.replaceState( state, /*no title*/'' );
            }
            else // This entry was pre-existing
            {
                position = state.position;
                const s = sessionStorage.getItem( KEY_positionLastShown ); // [FSS]
                if( s !== null )
                {
                    const positionLastShown = Number( s );
                    travel = position - positionLastShown;
                }
                else travel = 0; // Can happen (e.g.) on forward travel from an entry not "of ours"
            }
         // console.log( 'Travel direction was ' + direction ); // TEST
            document.documentElement.setAttributeNS( NS_REND, 'travel', String(travel) );

          // Stamp the session with the position last shown, which is now this position
          // -----------------
            sessionStorage.setItem( KEY_positionLastShown, String(position) );

          // Ensure crumb is showing or not, as appropriate
          // -----------------------
            if( travel < 0 )
            {
                const p = state.breadcrumbPath;
                if( p !== null )
                {
                    const pR = document.evaluate( p, document, /*namespace resolver*/null,
                      ORDERED_NODE_ITERATOR_TYPE, /* XPathResult to reuse*/null );
                    const a = pR.iterateNext(); // Resolved hyperlink source node, an HTML *a* element
                    console.assert( pR.iterateNext() === null, A ); /* There must only be the one
                      if *definitePath* is 'unambiguous' as required */
                    if( crumbHolder !== a )
                    {
                      // Show crumb
                      // ----------
                        ensureNoCrumbShowing();
                        a.setAttributeNS( NS_REND, 'showsBreadcrumb', 'showsBreadcrumb' );
                        crumbHolder = a;
                    }
                    return;
                }
            }

            ensureNoCrumbShowing();
        }



       // - - -

        document.documentElement.addEventListener( 'click', hearClick );
        addEventListener( 'pageshow', ( _PageTransitionEvent ) => // Which includes initial page load
        {
            reorient( history.state ); // Firefox can have the wrong value here [FHS]
        });
        addEventListener( 'popstate', ( /*PopStateEvent*/pop ) => // Same-page target (fragment) changes
        {
         // console.assert( (pop.state === null && history.state === null) // TEST
         //     || pop.state.position === history.state.position, A );
              // I thought a failure of this assumption might be behind a bug with Firefox [FHS].
              // But in fact, it seems never to fail; which suggests the two event types
              // need not determine the value of *state* differently, after all.
            reorient( pop.state );
        });
        return that;

    }() );



   // ==================================================================================================


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


    /** The generalized record of a way declaration document.
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


    /** Dealing with way declaration documents at large, not only the present document.
      */
    const Documents = ( function() // Changing?  sync'd → http://reluk.ca/project/wayic/lex/_/reader.js
    {

        const that = {}; // The public interface of Documents



        function d_tsk( doc, message )
        {
            if( doc === null ) throw NULL_PARAMETER;

            if( doc === document ) tsk( message );
        }



        function notifyReader( r, docReg, doc )
        {
            if( doc !== null ) r.read( docReg, doc );
            r.close( docReg );
        }


        /** The reader of all documents as registered by *addOmnireader*, or null if there is none.
          */
        let omnireader = null;



        const PRESENT_DOCUMENT_REGISTRATION = new DocumentRegistration( DOCUMENT_LOCATION, document );



        /** Map of pending and complete document registrations, including that of the present document.
          * The entry key is DocumentRegistration#location.  The value is either the registration itself
          * (DocumentRegistration) or the readers (Array of DocumentReader) that await it.
          */
        const registry = new Map().set( DOCUMENT_LOCATION, PRESENT_DOCUMENT_REGISTRATION );



       // - P u b l i c --------------------------------------------------------------------------------


        /** Registers a reader of all documents.  Immediately the reader is given the present document
          * and all documents that were retrieved in the past.  Any that are retrieved in future will
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
                if( !( entry instanceof DocumentRegistration )) continue; // Registration is pending

                notifyReader( reader, entry, entry.document );
            }
        };



        /** Tries to retrieve the indicated document for the given reader.  If *docLoc* indicates
          * the present document, then immediately the reader is given the present document as is,
          * followed by a call to reader.close.
          *
          * <p>Otherwise this method starts a retrieval process.  It may return early and leave
          * the process to finish later.  If the process succeeds, then it calls reader.read.
          * Regardless it always finishes by calling reader.close.</p>
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
            if( entry !== undefined )
            {
                if( entry instanceof DocumentRegistration ) notifyReader( reader, entry, entry.document );
                else // Registration is pending
                {
                    console.assert( entry instanceof Array, A );
                    entry/*readers*/.push( reader ); // Await the registration
                }
                return;
            }

            const readers = [];
            registry.set( docLoc, readers );
            readers.push( reader );

          // Configure a document request
          // ----------------------------
            const req = new XMLHttpRequest();
            req.open( 'GET', docLoc, /*async*/true ); // Misnomer; opens nothing, only sets config
         // req.overrideMimeType( 'application/xhtml+xml' );
         /// Still it parses to an XMLDocument (Firefox 52), unlike this document
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

                  // Test *id* declarations
                  // ----------------------
                    const traversal = doc.createNodeIterator( doc, SHOW_ELEMENT );
                    for( traversal.nextNode()/*onto the document node itself*/;; )
                    {
                        const t = traversal.nextNode();
                        if( t === null ) break;

                        const id = t.getAttribute( 'id' );
                        if( id !== null ) that.testIdForm( t, id );
                    }
                };

              // load end
              // - - - - -
                /** @param _event (Event) This is a mere ProgressEvent, at least on Firefox,
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
                req.ontimeout = function( e )
                {
                    console.warn( 'Document request timed out: ' + docLoc );
                };
            }

          // Send the request
          // ----------------
            req.send();
        };



        /** Tests whether the given *id* attribute declaration is well formed
          * for the purpose of waylinkage.  Returns true if it is well formed,
          * otherwise reports it as malformed and returns false.
          *
          *     @param t (Element) A waylink target node.
          *     @param id (string) The value of t's *id* attribute.
          */
        that.testIdForm = function( t, id )
        {
            if( id === null ) throw NULL_PARAMETER;

            let isWellFormed = true;
            const doc = t.ownerDocument;
            console.assert( t.hasAttribute('id'), A );
            t.removeAttribute( 'id' );
            const e = doc.getElementById( id );
            t.setAttribute( 'id', id );
            if( e !== null )
            {
                isWellFormed = false;
                d_tsk( doc, 'Malformed *id* declaration, value not unique: ' + a2s('id',id) );
            }
            return isWellFormed;
        };



       // - - -

        return that;

    }() );



   // ==================================================================================================


    /** Dealing with hyperlinks.
      */
    const Hyperlinkage = ( function()
    {

        const that = {}; // The public interface of Hyperlinkage



        function hearHashChange/* event handler */( /*HashChangeEvent ignored*/_event )
        {
            const hash = location.hash; // [WDL]
            const id = idTargeted = hash.length === 0? null: hash.slice(1);
            if( id !== null )
            {
                const e = document.getElementById( id );
                if( e !== null )
                {
                    setElementTargeted( e );
                    return;
                }
            }

            clearElementTargeted();
        }



       // - P u b l i c --------------------------------------------------------------------------------


        /** The element that is hyperlink-targeted by the browser, or null if there is none.
          *
          *     @return (Element)
          *     @see #idTargeted
          */
        that.elementTargeted = function() { return elementTargeted; };


            let elementTargeted = null;


            function clearElementTargeted()
            {
                if( elementTargeted === null ) return;

                if( elementTargeted.hasAttributeNS( NS_REND, 'isWaylinkTargetable' ))
                {
                    elementTargeted.setAttributeNS( NS_REND, 'isWaylinkTargetable', 'untargeted' );
                }
                elementTargeted = null;
            }


            function setElementTargeted( e )
            {
                if( elementTargeted === e ) return;

                if( elementTargeted !== null
                 && elementTargeted.hasAttributeNS( NS_REND, 'isWaylinkTargetable' ))
                {
                    elementTargeted.setAttributeNS( NS_REND, 'isWaylinkTargetable', 'untargeted' );
                }
                if( e.hasAttributeNS( NS_REND, 'isWaylinkTargetable' ))
                {
                    e.setAttributeNS( NS_REND, 'isWaylinkTargetable', 'targeted' );
                }
                elementTargeted = e;
            }



        /** The element identifier that is hyperlink-targeted by the browser, as obtained from
          * the fragment part of window.location without the preceding delimiter character '#'.
          * If the fragment part is missing, then the return value is null.
          *
          *     @return (string)
          *     @see #elementTargeted
          */
        that.idTargeted = function() { return idTargeted; };


            let idTargeted = null;


       // - - -

        window.addEventListener( 'hashchange', hearHashChange );
        hearHashChange.call( /*this*/window ); // initializing
        return that;

    }() );



   // ==================================================================================================


    /** A scanner of related documents.  It discovers related documents, scans them for references
      * to the present document, and updates the rendering of the present document based on the results.
      */
    const InterdocScanner = ( function()
    {

        const that = {}; // The public interface of InterdocScanner



        /** @param doc (Document) The document to scan.
          * @param docLoc (string) The location of the document in normal form.
          */
        function scan( doc, docLoc )
        {
            const traversal = doc.createNodeIterator( doc, SHOW_ELEMENT );
            for( traversal.nextNode()/*onto the document node itself*/;; )
            {
                const t = traversal.nextNode();
                if( t === null ) break;

                const linkV = t.getAttributeNS( NS_COG, 'link' );
                if( linkV === null ) continue;

                let link;
                try { link = new LinkAttribute( linkV ); }
                catch( unparseable ) { continue; }

                // No need here to fend against other types of malformed link declaration.
                // Rather take it as the wayscribe intended.
                let targDocLoc = link.targetDocumentLocation;
                targDocLoc = targDocLoc.length > 0? URIs.normalized(targDocLoc): docLoc;
                if( targDocLoc !== DOCUMENT_LOCATION ) continue;

                const target = document.getElementById( link.targetID );
                if( target === null) continue;

                if( target.interlinkScene ) continue; // The work is already done

                target.interlinkScene = true;
                target.removeAttributeNS( NS_REND, 'isOrphan' );
            }
        }



       // - P u b l i c --------------------------------------------------------------------------------


        /** Starts this scanner.
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


    /** A device to complete the rendering of interdocument bitform waylinks, those whose target nodes
      * are outside of the present document.  It fetches the documents, reads their target nodes
      * and amends the rendered wayscript accordingly.
      */
    const InterdocWaylinkRenderer = ( function()
    {

        const that = {}; // The public interface of InterdocWaylinkRenderer



        /** Map of registered links.  The key to each entry is the location (string) in normal URL form
          * of a targeted way declaration document; the value a list of registrations (Array of Inter-
          * docWaylinkRenderer_Registration), one for each bitform, waylink source node of the present
          * document that targets the keyed document, if any.  The keys cover every directly reachable
          * way declaration document as far as possible, regardless of how its source nodes are formed,
          * while the registration lists cover only those source nodes in waylink bitform.
          */
        let linkRegistry = new Map(); // Nulled on *start*



        const MYSTERY_SYMBOL = '?';



        /** @param loc (string) The location of the target document in normal URL form.
          * @return (Array of InterdocWaylinkRenderer_Registration)
          *
          * @see URIs#normalized
          */
        function registerTargetDocument( loc )
        {
            let regList = linkRegistry.get( loc );
            if( regList === undefined )
            {
                if( loc.length !== URIs.defragmented(loc).length )
                {
                    throw MALFORMED_PARAMETER + ': Fragmented (#) document location: ' + loc;
                }

                if( URIs.isDetectedAbnormal( loc )) throw URIs.message_abnormal( loc );

                if( loc === DOCUMENT_LOCATION ) throw MALFORMED_PARAMETER + ': Not a separate document';

                regList = [];
                linkRegistry.set( loc, regList );
            }
            return regList;
        }



        function setTargetPreview( sourceNode, newPreviewString )
        {
            const forelinker = sourceNode.lastChild;
            const preview = asElementNamed( 'preview', forelinker.firstChild/*a*/.firstChild );
            const previewText = preview.firstChild;
            previewText.replaceData( 0, previewText.length, newPreviewString );
            configureForTargetPreview( sourceNode, preview, newPreviewString );
        }



        /** Ensures that all interdocument bitform waylinks are rendered and their target images cached.
          */
        function start1_presentDocument( linkRegistry )
        {
            for( const entry of linkRegistry )
            {
                const linkRegList = entry[1];
                if( linkRegList.length === 0 ) continue; // No bitform links to this target

                const targDocLoc = entry[0];
                Documents.readNowOrLater( targDocLoc, new class extends DocumentReader
                {
                    close( docReg )
                    {
                        if( docReg.document !== null ) return;

                        for( const r of linkRegList ) setTargetPreview( r.sourceNode, MYSTERY_SYMBOL );
                    }

                    read( docReg, targDoc )
                    {
                        for( const linkReg of linkRegList )
                        {
                            const id = linkReg.targetID;
                            const target = targDoc.getElementById( id );
                            const source = linkReg.sourceNode;
                            const linkV = source.getAttributeNS( NS_COG, 'link' ); /* Nominal form as
                              declared (for reporting only) of normalized form <targDocLoc>#<id> */
                            if( target === null )
                            {
                              // Flag the source node as broken
                              // --------------------
                                tsk( 'Broken link: No such *id* in that document: ' + a2s('link',linkV) );
                                setTargetPreview( source, BREAK_SYMBOL );
                                source.setAttributeNS( NS_REND, 'isBroken', 'isBroken' );
                                continue;
                            }

                            LeaderReader.read( target );
                            const sL = LeaderReader.leader;
                            const sN = source.localName;
                            const sNS = source.namespaceURI;
                            const image = new TargetImage( sL, sN, sNS );
                            if( image.equals( /*imageWas*/linkReg.image ))
                            {
                              // Affirm the source node as is
                              // ----------------------
                                source.removeAttributeNS( NS_REND, 'image' );
                                continue;
                            }

                          // Amend the source node, as it shows an outdated image
                          // ---------------------
                            const reRendering = new PartRenderingC2( source );
                            configureForTarget( sNS, sN, linkV, isBitNS(sNS), target, reRendering );
                            reRendering.render();
                            setTargetPreview( source, sL );

                          // Update the cached image
                          // -----------------------
                            TargetImageCache.write( targDocLoc + '#' + id, image );
                        }
                    }
                });
            }
        }



        /** Pre-caches the target images for each way declaration document that is directly reachable
          * from the present document.
          */
        function start2_targetDocuments( linkRegistry )
        {
            // Now call each such target a source, and image  *its* targets:
            for( const srcDocLoc of linkRegistry.keys() )
            {
                Documents.readNowOrLater( srcDocLoc, new class extends DocumentReader
                {
                    read( _docReg/*ignored*/, srcDoc )
                    {
                        const traversal = srcDoc.createNodeIterator( srcDoc, SHOW_ELEMENT );
                        for( traversal.nextNode()/*onto the document node itself*/;; )
                        {
                            const source = traversal.nextNode();
                            if( source === null ) break;

                            const sNS = source.namespaceURI;
                            if( !isBitNS( sNS )) continue; // Needs no target image, link is not bitform

                            const linkV = source.getAttributeNS( NS_COG, 'link' );
                            if( linkV === null ) continue;

                            let link;
                            try { link = new LinkAttribute( linkV ); }
                            catch( unparseable ) { continue; }

                            // No need here to fend against other types of malformed link declaration;
                            // no harm in caching a superfluous image.
                            let targDocLoc = link.targetDocumentLocation;
                            if( targDocLoc.length === 0 ) continue;
                              // Target image needs no caching, target in same document

                            targDocLoc = URIs.normalized( targDocLoc );
                            if( targDocLoc === srcDocLoc ) continue;
                              // Target image needs no caching, target in same document

                            Documents.readNowOrLater( targDocLoc, new class extends DocumentReader
                            {
                                read( _docReg/*ignored*/, targDoc )
                                {
                                    const id = link.targetID;
                                    const target = targDoc.getElementById( id );
                                    if( target === null ) return; // Broken link

                                    LeaderReader.read( target );
                                    TargetImageCache.write( targDocLoc + '#' + id,
                                      new TargetImage( LeaderReader.leader, source.localName, sNS ));
                                }
                            });
                        }
                    }
                });
            }
        }



       // - P u b l i c --------------------------------------------------------------------------------


        /** Tells this renderer of a separate way declaration document that the user may reach
          * from the present document by a direct link, which is not a bitform waylink.
          *
          *     @param loc (string) The location of the other document in normal URL form.
          *
          *     @see #registerBitformLink
          *     @see URIs#normalized
          */
        that.noteTargetDocument = function( loc ) { registerTargetDocument( loc ); };



        /** Registers an unresolved, interdocument bitform waylink and returns the registration.
          *
          *     @param sourceNode (Element) A bitform waylink source node that targets another document.
          *     @param targDocLoc (string) The location of the other document in normal URL form.
          *     @param id (string) The identifier of the target within the other document.
          *
          *     @return (InterdocWaylinkRenderer_Registration)
          *
          *     @see URIs#normalized
          */
        that.registerBitformLink = function( sourceNode, targDocLoc, id )
        {
            const reg = new InterdocWaylinkRenderer_Registration( sourceNode, targDocLoc, id );
            const regList = registerTargetDocument( targDocLoc );
            regList.push( reg );
            return reg;
        };



        /** Starts this renderer.
          */
        that.start = function()
        {
            start1_presentDocument( linkRegistry );
            setTimeout( start2_targetDocuments, 191/*ms, browser rest*/, linkRegistry );
            linkRegistry = null; /* Freeing it for eventual garbage collection,
              and blocking henceforth any further attempt to register */
        };



       // - - -

        return that;

    }() );



   // ==================================================================================================


    class InterdocWaylinkRenderer_Registration
    {

        constructor( sourceNode, targDocLoc, id )
        {
            this._sourceNode = sourceNode;
            this._targetID = id;
            this._targetImage = TargetImageCache.read( targDocLoc + '#' + id );
        }


        /** The waylink source node (Element).
          */
        get sourceNode() { return this._sourceNode; }


        /** The identifier of the target (string) within the other document.
          */
        get targetID() { return this._targetID; }


        /** The image of the target (TargetImage) as retrieved from the cache,
          * or null if none was cached.
          */
        get targetImage() { return this._targetImage; }

    }



   // ==================================================================================================


    /** A reader of element leaders.  An element leader is the whitespace collapsed, text content
      * of the element prior to any contained element of wayscript or non-inline layout.
      *
      * <p>To learn merely whether an element has a leader of non-zero length, give a maxLength
      * of zero to the *read* function then inspect *hasLeader* for the answer.</p>
      */
    const LeaderReader = ( function()
    {

        const that = {}; // The public interface of LeaderReader



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
            let headroom = maxLength; // Space remaining for the next word
         // let child = null; // Tracking the last child that was encountered in the dive
            dive: for( ;; )
            {
                const d = dive.nextNode();
                if( d === null ) break dive;

             // if( d.parentNode === element ) child = d;
                const dType = d.nodeType;
                if( dType === TEXT )
                {
                    const words = d.data.match( /\S+/g );
                    if( words === null ) continue dive;

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
                            leader += ' '; // Word separator
                            --headroom;
                        }
                        leader += word;
                        headroom -= wN;
                     // if( firstContributingChild === null ) firstContributingChild = child;
                     // lastContributingChild = child;
                    }
                }
                else if( dType === ELEMENT )
                {
                    const dNS = d.namespaceURI;
                    if( dNS.endsWith(NS_REND) && dNS.length === NS_REND.length ) // Fast failing test
                    {
                        if( !toIncludeRend ) toLastDescendant( dive ); // Bypassing d and its content
                    }
                    else if( dNS.startsWith( NS_WAYSCRIPT_DOT )) break dive;
                    else
                    {
                        const styleDeclarations = getComputedStyle( d );
                        const displayStyle = styleDeclarations.getPropertyValue( 'display' );
                        if( displayStyle === 'inline' ) continue dive;

                        if( styleDeclarations.length === 0 ) // Then something's wrong
                        {
                            // Work around it.  Apparent browser bug (Chrome 59).  "All longhand proper-
                            // ties that are supported CSS properties" must be reported, ∴ length should
                            // be > 0.  https://drafts.csswg.org/cssom/#dom-window-getcomputedstyle
                            if( dNS === NS_HTML && willDisplayInLine_likely(d) ) continue dive;
                        }

                        break dive;
                    }
                }
            }

            that.element = element;
            that.leader = leader;
            that.hasLeader = hasLeader;
         // that.startChild = firstContributingChild;
         // that.endChild = lastContributingChild === null? null: lastContributingChild.nextSibling;
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
            let loc = URIs.defragmented( value ); // Document location
            {
                const fragment = value.slice( loc.length + 1 );
                if( fragment === '' )
                {
                    throw "Missing fragment sign '#' in target identifier: " + a2s('link',value);
                }

                this._targetID = fragment;
            }
            if( loc.length > 0 )
            {
                if( loc.charAt(0) === '/'
                  && /*not a network-path reference*/(loc.length === 1 || loc.charAt(1) !== '/') ) // [NPR]
                {
                    loc = CAST_BASE_REF + loc; // Waycast space → universal space
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


        /** Sets an *href* attribute on the given element in reference to the target node.
          */
        hrefTo( el ) { el.setAttribute( 'href', this._targetDocumentLocation + '#' + this._targetID ); }



        /** The location of the target document as a URL string, or the empty string if the *link*
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

        const that = {}; // The public interface of Marginalia



        /** Lays or re-lays the given marginalis.
          *
          *     @param marginalis (Element)
          *     @param tagVpBounds (DOMRectReadOnly) The bounds within the scroller's viewport
          *       of the parent start tag.  If undefined, then this parameter is determined anew.
          */
        function lay( marginalis, tagVpBounds = marginalis.parentNode.getBoundingClientRect() )
        {
            let s; // Style

          // Span the left margin from page edge to tag
          // --------------------
            const width = tagVpBounds.left + scrollX;
            s = marginalis.style;
            s.setProperty( 'left', -width + 'px' );
            s.setProperty( 'width', width + 'px' );

          // Clamp down on the icon (child)
          // ----------------------
            const iconVpBounds = marginalis.lastChild/*icon*/.getBoundingClientRect();
            const height = iconVpBounds.height;
            if( !height/*UZ*/ ) throw 'Target icon is unlaid';

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
              // Allowing it to expand up to MAX_GAP, if that much is available
            const lineWidth = iconX - gap;
            s.setProperty( 'width', lineWidth + 'px' ); // [readable.css HSP]
            s.setProperty( 'height',   height + 'px' );
         // liner.setAttribute( 'width', lineWidth );
         // liner.setAttribute( 'height',   height );
         /// A failed attempt to fix the liner.getBBox failure in TargetLining, q.v.
            s.setProperty( 'display', UNSET_STYLE ); // To whatever it was
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
         // requestAnimationFrame( layIf ); // Delaying the first poll of tagVpBounds, no hurry
            setTimeout( layIf, 49/*ms, browser rest*/ );
            let pollCount = 0;
            function layIf( _msTime/*ignored*/ )
            {
                const tagVpBounds = eSTag.getBoundingClientRect();
                if( tagVpBounds.width ) // Then the tag is laid
                {
                  // Lay the marginalis and show it
                  // ------------------------------
                    lay( marginalis, tagVpBounds );
                    marginalis.style.setProperty( 'visibility', 'visible' ); // Overriding readable.css

                  // Ensure it re-lays itself as needed
                  // ------------------------
                    addEventListener( 'resize', (e)=>{lay(marginalis);} );
                }
                else if( pollCount <= 3 )
                {
                    ++pollCount;
                    requestAnimationFrame( layIf ); // Wait for the tag to get laid
                }
                else console.error( "Cannot lay marginalis, start tag is not being laid" );
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


            /** A non-null value indicates a rendering that might actually be re-rendered.
              * Meantime the rendering is either based on a cached image of the target node
              * (value ‘present’) or not (‘absent’).
              */
            this.image = null;


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
            const image = this.image;
  /*[C2]*/  if( image !== null ) e.setAttributeNS( NS_REND, 'image', image );

          // Leader
          // ------
            const toIncludeRend = true;
              // Else the leader would exclude *forelinker* content in the case of a waylink source node
            console.assert( e.firstChild === null || e.firstChild.nodeName !== 'eSTag', A );
              // Else the leader would include the start tag
            LeaderReader.read( e, /*maxLength*/0, toIncludeRend );
  /*[C2]*/  if( LeaderReader.hasLeader ) e.setAttributeNS( NS_REND, 'hasLeader', 'hasLeader' );

          // Start tag
          // ---------
            console.assert( this.eSTag === null, AA + 'Method *render* is called once only' );
            const eSTag = this.eSTag = document.createElementNS( NS_REND, 'eSTag' );
  /*[C2]*/  e.insertBefore( eSTag, e.firstChild );
            const eQName = eSTag.appendChild( document.createElementNS( NS_REND, 'eQName' ));

          // prefix part of name
          // - - - - - - - - - -
            const prefix = e.prefix;
            let isPrefixAnonymousOrAbsent;
            if( prefix !== null )
            {
                const ePrefix = eQName.appendChild( document.createElementNS( NS_REND, 'ePrefix' ));
                ePrefix.appendChild( document.createTextNode( prefix ));
                if( prefix === ELEMENT_NAME_NONE )
                {
                    isPrefixAnonymousOrAbsent = true;
                    ePrefix.setAttributeNS( NS_REND, 'isAnonymous', 'isAnonymous' );
                }
                else isPrefixAnonymousOrAbsent = false;
            }
            else isPrefixAnonymousOrAbsent = true;

          // local part of name
          // - - - - - - - - - -
            const eName = eQName.appendChild( document.createElementNS( NS_REND, 'eName' ));
            let lp = this.localPartOverride === null? e.localName : this.localPartOverride;
            const isAnonymous = lp === ELEMENT_NAME_NONE;
            if( isAnonymous )
            {
                lp = '●'; // Unicode 25cf (black circle)
                eQName.setAttributeNS( NS_REND, 'isAnonymous', 'isAnonymous' );
            }
            else if( lp.charAt(0) !== '_' ) lp = lp.replace( /_/g, NO_BREAK_SPACE ); /* If it starts
              with a non-underscore, which hopefully means it has some letters or other visible content,
              then replace any underscores with nonbreaking spaces for sake of readability. */
            eName.appendChild( document.createTextNode( lp ));

          // rendering of name
          // - - - - - - - - -
            const eNS = e.namespaceURI;
            let renderedName, maxShort;
            if( eNS === NS_STEP )
            {
                renderedName = isAnonymous && !isPrefixAnonymousOrAbsent? prefix: lp;
                maxShort = 1; // Less to allow room for extra padding that readable.css adds
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
            if( eSTag === null ) throw 'Missing eSTag';

            element.removeChild( eSTag );

            // Remove any attributes that might have been set:
            element.removeAttributeNS( NS_REND, 'hasLeader' );
            element.removeAttributeNS( NS_REND, 'hasShortName' );
            element.removeAttributeNS( NS_REND, 'image' );
        }

    }




   // ==================================================================================================


    /** The control of self hyperlinking and scene switching for waylink target nodes.
      */
    const TargetControl = ( function()
    {

        const that = {}; // The public interface of TargetControl



        /** @param click (MouseEvent) A click event from within the start tag.
          */
        function hearClick/* event handler */( click )
        {
            const eSTag = click.currentTarget; // Where listening
            const eClicked = click.target;    // What got clicked

          // Empty container space clicked?  No function
          // ---------------------
            const eClickedNS = eClicked.namespaceURI;
            if( eClickedNS === NS_HTML ) // Marginalis
            {
                console.assert( eClicked.parentNode === eSTag && eClicked.localName === 'div', A );
                return;
            }

            if( eClicked === eSTag ) return;

          // Target liner clicked?  Function is scene switching
          // ------------
            const targetNode = eSTag.parentNode; // *Waylink* target node
            const elementTargeted = Hyperlinkage.elementTargeted();
            if( eClickedNS === NS_SVG ) // Target liner
            {
                if( targetNode !== elementTargeted ) return; // Switch is disabled

                const u = new URL( location.toString() ); // [WDL]
                u.hash = ''; // Remove the fragment
                const pp = u.searchParams;
                pp.set( 'sc', 'inter' );
                pp.set( 'link', targetNode.getAttribute('id') );
             // history.replaceState( /*same*/history.state, /*no title*/'', u.href ); // TEST
                return;
            }

          // Icon or tag name clicked:  Function is self hyperlinking
          // ----------------
            const view = document.scrollingElement; // Within the viewport
            const scrollTopWas = view.scrollTop;
            const scrollLeftWas = view.scrollLeft;

          // toggle the browser location, targeted ⇄ untargeted
          // - - - - - - - - - - - - - -
            if( targetNode === elementTargeted ) // Then transit targeted → untargeted
            {
                location.hash = ''; // Moving to the untargeted location, no URI fragment in address bar
                const loc = location.toString(); // [WDL]
                if( loc.endsWith( '#' )) // Then it left the fragment delimiter hanging there, visible,
                {                 // like the grin of the Cheshire Cat (Firefox, Chrome).  Remove it:
                    history.replaceState( /*same*/history.state, /*no title*/'', loc.slice(0,-1) );
                }
            }
            else location.hash = targetNode.getAttribute( 'id' ); // Untargeted → targeted

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
                const icon = event.currentTarget; // Where listening
                return asElementNamed( 'eQName', icon.parentNode/*marginalis*/.previousSibling );
            }


            function hearMouse_unidentify( eQName )
            {
                eQName.removeAttribute( 'id' );
                hearMouse_eQNameIdentified = null;
            }


            /** @param event (MouseEvent) A 'mouseenter' event from the target icon.
              */
            function hearMouseEnter/* event handler */( event )
            {
                if( hearMouse_eQNameIdentified ) hearMouse_unidentify( hearMouse_eQNameIdentified );
                  // Preclude duplication, to be sure
                const eQName = hearMouse_eQName( event );
                eQName.setAttribute( 'id', NS_REND + '.TargetControl.iconHover' ); // [readable.css GSC]
                hearMouse_eQNameIdentified = eQName;
            }


            /** @param event (MouseEvent) A 'mouseleave' event from the target icon.
              */
            function hearMouseLeave/* event handler */( event )
            {
                hearMouse_unidentify( hearMouse_eQName( event ));
            }



       // - P u b l i c --------------------------------------------------------------------------------


        /** Adds controls for a target node.
          *
          *     @param eSTag (Element) The start tag of the target node.
          */
        that.addControls = function( eSTag )
        {
            eSTag.addEventListener( 'click', hearClick );
            const icon = asElementNamed( 'icon', eSTag.lastChild/*marginalis*/.lastChild );
            icon.addEventListener( 'mouseenter', hearMouseEnter );
            icon.addEventListener( 'mouseleave', hearMouseLeave );
        };



       // - - -

        return that;


    }() );



   // ==================================================================================================


    /** The image of a waylink target node as mirrored in the rendering of its source nodes.
      */
    class TargetImage
    {

        constructor( leader, localName, namespaceURI )
        {
            if( leader === undefined || leader === null
             || !localName/*[UN]*/ || !namespaceURI/*[UN]*/ ) throw MALFORMED_PARAMETER;

            this._leader = leader;
            this._localName = localName;
            this._namespaceURI = namespaceURI;
        }



        /** Answers whether this image equals another.
          *
          *     @param other (TargetImage) The other image, which may be null.
          */
        equals( other )
        {
            if( other == null ) return false;

            return _leader === other.leader
              && _localName === other.localName
              && _namespaceURI === other.namespaceURI;
        }



        /** @see LeaderReader#leader
          */
        get leader() { return this._leader; }



        /** @see Element#localName
          */
        get localName() { return this._localName; }



        /** @see Element#namespaceURI
          */
        get namespaceURI() { return this._namespaceURI; }


    }



   // ==================================================================================================


    const TargetImageCache = ( function() // [TIC]
    {

        const that = {}; // The public interface of TargetImageCache



        const KEY_PREFIX = NS_REND + '.TargetImageCache.';



       // - P u b l i c --------------------------------------------------------------------------------



        /** Retrieves the image of the indicated target.
          *
          *     @param targetLoc (string) The target location in normal URL form.
          *     @return (TargetImage) The cached image, or null if none is cached.
          *
          *     @see URIs#normalized
          */
        that.read = function( targetLoc )
        {
            const s = sessionStorage.getItem( KEY_PREFIX + targetLoc );
            if( s !== null )
            {
                const p = JSON.parse( s );
                try { return new TargetImage( p._leader, p._localName, p._namespaceURI ); }

                catch( x ) { if( isUserNonProgrammer || x !== MALFORMED_PARAMETER ) throw x; }
                  // Expecting malformed parameters while recoding
            }

            return null;
        };



        /** Stores the image of the indicated target.
          *
          *     @param targetLoc (string) The target location in normal URL form.
          *     @param image (TargetImage)
          *
          *     @see URIs#normalized
          */
        that.write = function( targetLoc, image )
        {
            if( URIs.isDetectedAbnormal( targetLoc )) throw URIs.message_abnormal( targetLoc );

            if( image === null ) throw NULL_PARAMETER;

            sessionStorage.setItem( KEY_PREFIX + targetLoc,
              JSON.stringify( image, /*replacer*/null, /*space*/1 ));
        };



       // - - -

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

        const that = {}; // The public interface of TargetLining

        // Dimensions and coordinates are here given in pixels, except where marked otherwise.



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
            liner.appendChild( document.createElementNS( NS_SVG, 'circle' )); // Edge mark
            liner.appendChild( document.createElementNS( NS_SVG, 'path' ));  // Line
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
         /// That failed, now they're given as parameters instead

          // Draw the line
          // -------------
            const midY = height / 2; // Vertically centered
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
                    display = UNSET_STYLE; // To whatever it was
                }
                else display = 'none'; // Too short
                line.style.setProperty( 'display', display );
            }

          // Draw the edge mark
          // ------------------
            const mark = asElementNamed( 'circle', liner.firstChild );
            mark.setAttribute(  'r', EDGE_MARK_RADIUS + 'px' );
            mark.setAttribute( 'cx', EDGE_MARK_RADIUS + 'px' ); // Abutting the document edge
            mark.setAttribute( 'cy', midY + 'px' );
        };



       // - - -

        return that;

    }() );



   // ==================================================================================================


    const TARGET_UP   = 'up';
    const TARGET_DOWN = 'down';



    /** Where approximately a waylink target node is in relation to its source.
      */
    class TargetWhereabouts
    {


        /** Constructs a TargetWhereabouts.
          *
          *     @param source (Element) The waylink source node.
          *     @param link (LinkAttribute) The parsed *link* attribute of the source node.
          */
        constructor( source, link )
        {
            const docLoc = link.targetDocumentLocation;
            if( docLoc.length > 0 )
            {
                const docLocN = URIs.normalized( docLoc );
                if( docLocN !== DOCUMENT_LOCATION ) // Then the target is outside the present document
                {
                    this._direction = null;
                    this._documentLocationN = URIs.normalized( docLoc );
                    this._target = null;
                    return;
                }
            }

            // The target is nominally within the present document
            this._documentLocationN = '';
            const target = document.getElementById( link.targetID );
            this._target = target;
            if( target !== null )
            {
                const targetPosition = source.compareDocumentPosition( target );
                if( targetPosition & DOCUMENT_POSITION_PRECEDING ) this._direction = TARGET_UP;
                else
                {
                    console.assert( targetPosition & DOCUMENT_POSITION_FOLLOWING, A );
                    this._direction = TARGET_DOWN;
                }
            }
            else
            {
                tsk( 'Broken waylink: No such *id* in this document: ' + a2s('link',link.value) );
                this._direction = null;
            }
        }



       // ----------------------------------------------------------------------------------------------


        /** The relative direction to the target node if it exists in the present document.
          *
          *     @return (string) Either TARGET_UP or TARGET_DOWN,
          *       or null if the target is nominally outside the present document.
          */
        get direction() { return this._direction; }



        /** The nominal location of the target document as a URL string in normal form,
          * or the empty string if the target is nominally in the present document.
          */
        get documentLocationN() { return this._documentLocationN; }



        /** The waylink target node within the present document, or null if there is none.
          * This property is null in the case of an interdocument or broken waylink.
          */
        get target() { return this._target; }

    }



   // ==================================================================================================


    /** Dealing with the viewport and its scroller.
      */
    const ViewPortage = ( function()
    {

        const that = {}; // The public interface of ViewPortage



        const targetPositioningOptions = { behavior:'instant', block:'start', inline:'nearest' }



       // - P u b l i c --------------------------------------------------------------------------------


        /** Ensures that the hyperlink-targeted element, if any, will be visible within the viewport.
          *
          *     @see Hyperlinkage#elementTargeted
          */
        that.ensureTargetShows = function() // [HTP]
        {
            const e = Hyperlinkage.elementTargeted();
            if( e === null ) return;

            const eBounds = e.getBoundingClientRect();
            const eTop = eBounds.top;
            if( eTop >= 0 )
            {
                const vHeight = window.innerHeight; // Approximate height of viewport [SVS]
                const eBottom = eBounds.bottom;
                if( eBottom <= vHeight ) return; // Whole of element is visible

                if( eTop < vHeight / 4 ) return; // Top alone is visible, yet reaches upper quarter
            }

         // console.debug( 'ViewPortage.ensureTargetShows: Repositioning' ); // TEST
            e.scrollIntoView( targetPositioningOptions );
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

        const that = {}; // The public interface of WayTracer



        /** Answers whether the specified leg is already traced.
          *
          *     @see #newLegID
          *     @see #shutLeg
          */
        function isShut( legID ) { return legsShut.includes(legID); }
          // The likely efficiency of this test is asserted by INC FAST, q.v.



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
              // Spacing matters here, cf. shutLeg
        }



        /** The location of the root way declaration document (string) in normal URL form.
          *
          *     @see http://reluk.ca/project/wayic/cast/root#root_way_declaration_document
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
              // Spacing matters here, cf. openLeg
            legsShut.push( legID );
            if( legsOpen.length > 0 ) return;

          // After all are shut
          // ------------------
            console.assert( legsShut.length < 200, AA + 'INC FAST, q.v.' );
              // Asserting the likely efficiency of the tests legsOpen and legsShut.includes
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
            if( doc === document )
            {
                branch.setAttributeNS( NS_REND, 'isOnWayBranch', 'isOnWayBranch' );
             // console.debug( '\t\t\t(in present document)' ); // TEST
            }
            let t = branch;
            const traversal = doc.createTreeWalker( t, SHOW_ELEMENT );
            do
            {
              // Source node, case of
              // -----------
                const linkV = t.getAttributeNS( NS_COG, 'link' );
                source: if( linkV !== null )
                {
                    let link;
                    try { link = new LinkAttribute( linkV ); }
                    catch( unparseable ) { break source; }

                    // No need here to fend against other types of malformed waylink declaration.
                    // Rather take it as the wayscribe intended, and so extend the trace.
                    let tDocLoc = link.targetDocumentLocation;
                    tDocLoc = tDocLoc.length > 0? URIs.normalized(tDocLoc): docLoc;
                    const targetID = link.targetID;
                    const targetLegID = newLegID( tDocLoc, targetID );
                    if( wasOpened( targetLegID )) break source;

                    openLeg( targetLegID );
                    Documents.readNowOrLater( tDocLoc, new class extends DocumentReader
                    {
                        close( tDocReg )
                        {
                            if( tDocReg.document === null ) shutLeg( targetLegID );
                            // Else readDirectly has (or will) shut it
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
                            const target = tDoc.getElementById( targetID );
                            subTrace: if( target !== null )
                            {
                              // Shield the sub-trace work with a scan of ancestors
                              // --------------------------------------------------
                                for( let r = target;; )
                                {
                                    r = r.parentNode;
                                    const ns = r.namespaceURI;
                                    if( ns === null ) // Then r is the document node
                                    {
                                        tsk( 'Malformed document: Missing HTML *body* element: ' + tDocLoc );
                                        break;
                                    }

                                    if( isBitNS( ns ))
                                    {
                                        const id = r.getAttribute( 'id' );
                                        if( id === null ) continue;

                                        if( isShut( newLegID( tDocLoc, id ))) break subTrace;
                                          // If only for sake of efficiency, ∵ this target branch is
                                          // already covered (or will be) as part of a larger branch.
                                    }
                                    else if( r.localName === 'body' && ns === NS_HTML ) break;
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
                         /// But more efficiently (as a microtask) and properly bound as a method call:
                            Promise.resolve().then( (()=>
                            {
                                this.readDirectly( tDocReg, tDoc );
                            }).bind( this ));
                            // This merely postpones execution till (I think) the end of the current
                            // event loop.  A more elegant and useful solution might be to specifically
                            // await the shut state of the present leg.  Maybe that too could be done
                            // using this new Promise/async facility?
                        }
                    });
                }

              // Target node, case of
              // -----------
                const id = t.getAttribute( 'id' );
                if( id && isShut(newLegID(docLoc,id)) ) toLastDescendant( traversal ); /* Bypassing
                  sub-branch t, if only for efficiency, as already it was traced in a separate leg. */
            }
            while( (t = traversal.nextNode()) !== null );
        }



        /** Answers whether the specified leg was ever opened.
          *
          *     @see #newLegID
          *     @see #openLeg
          */
        function wasOpened( legID ) { return legsOpen.includes(legID) || legsShut.includes(legID); }
          // The likely efficiency of these tests is asserted by INC FAST, q.v.



       // - P u b l i c --------------------------------------------------------------------------------


        /** Starts this tracer.
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
                    const target = doc.getElementById( 'root', doc );
                    if( target !== null ) traceLeg( id, target, docReg );
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
  *  [AEP]  Avoid Element attribute properties *className* and *id*.
  *         They evaluate to an ‘empty string’ in cases where the attribute is absent.
  *         https://dom.spec.whatwg.org/#concept-element-attributes-get-value
  *
  *         Rather use Element.getAttribute.  It returns null in those cases, as one would expect.
  *         https://dom.spec.whatwg.org/#dom-element-getattribute.
  *
  *         See also Element.classList.
  *
  *  [BA] · Boolean attribute.  A boolean attribute such as [rend:isFoo] either has the same value
  *         as the local part of its name (‘isFoo’), which makes it true, or it is absent
  *         and thereby false.  cf. http://w3c.github.io/html/infrastructure.html#sec-boolean-attributes
  *
  *  [C2] · The constructor of PartRenderingC2 must remove all such markup.
  *
  *  [FHS]  Firefox (52.2) has the wrong history.state after travelling over entries E → E+2 → E+1,
  *         at least if E and E+1 differ only in fragment: it has state E, but should have E+1.
  *
  *  [FIB]  Focus for inline breadcrumbs.  Here avoiding use of the HTML focus facility as a base
  *         for inline breadcrumb trails.  It seems unreliable.  The browsers are doing their own
  *         peculiar things with focus which are hard to work around.
  *         http://w3c.github.io/html/editing.html#focus
  *
  *  [FSS]  Use of the session store by documents loaded on ‘file’ scheme URLs.  On moving from document
  *         D1 to new document D2 by typing in the address bar (not activating a link), an item stored
  *         by D2 may, after travelling back, be unreadable by D1, as though it had not been stored.
  *         Affects Firefox 52.6.  Does not affect Chrome running with --allow-file-access-from-files.
  *
  *  [HTP]  Hyperlink target positioning.  Normally the browser itself does this, vertically scrolling
  *         the view to ensure the target appears in the viewport.  Firefox 60 was seen to fail however.
  *         It failed when this program was loaded by a *script* element injected at runtime.
  *         Probably because then the program was late in running and late in styling the elements
  *         - especially in giving the crucial display style of ‘block’ to the specialized elements,
  *         which are XML, and therefore ‘inline’ by default - and this confused the browser.
  *
  *         A remedy might be to make this program load immediately.  The only reliable way, however,
  *         is to have the wayscribe write the *script* element into every way declaration document,
  *         which would be too awkward.  To instead write the *script* element programatically
  *         is disallowed for XML documents, and ‘strongly discouraged’ as unreliable for non-XML.
  *         http://w3c.github.io/html/webappapis.html#documentwrite
  *
  *         That leaves only *eval* or *Function*.  https://stackoverflow.com/a/21730944/2402790
  *         Neither seems reliable, especially in the case of debugging.
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
  *  [PD] · Path data.  It could instead be defined using the new SVGPathData interface, but this
  *         (array-form instead of string-form definition) wouldn’t help enough to outweigh the bother
  *         of using a polyfill.  https://github.com/jarek-foksa/path-data-polyfill.js
  *
  *  [SBU]  Spurious breadcrumb with unlinked travel.  This is a BUG.  On moving forward from
  *         history entry E1 to a new entry E2 by typing in the address bar (not activating a link),
  *         any breadcrumb in E1 will remain where it lies on some hyperlink source node.
  *         This is incorrect.  It is incorrect because the unlinked move to E2 had no point
  *         of departure.  The crumb that records such a point should have been removed.
  *         Not being removed, it shows itself on moving back to E1.  This is misleading.
  *             The bug might be repaired by removing any breadcrumb after first showing it.
  *         But this would partly defeat its purpose in the more typical case of a linked E2:
  *         the crumb would no longer show during back-and-forth motion between E1 and E2.
  *
  *  [SVS]  Surrogate of viewport size.  Here using the size of the viewport including its scrollbar
  *         (if any) as a rough surrogate for the viewport size alone, which is harder to obtain.
  *
  *  [TIC]  TargetImageCache.  The purpose of caching the target images is to stablize the view within
  *         the viewport, especially on the vertical axis.  The vertical layout of the view depends on
  *         target imaging.  Images for extradocument targets cannot always be resolved synchronously.
  *         Their delayed resolution may cause layout changes that deflect the view vertically.
  *         Image caching and pre-caching are able to prevent this and stabilize the view in all
  *         but a few edge cases.
  *
  *  [UN] · Either undefined or null in value.
  *
  *  [UZ] · Either undefined or zero in value.
  *
  *  [WDL]  ‘window.location’ or ‘document.location’?  One may use either, they are identical.
  *         https://www.w3.org/TR/html5/browsers.html#the-location-interface
  *
  *  [XN] · XML names.  https://www.w3.org/TR/xml-names/
  */


// Copyright © 2017-2018 Michael Allan and contributors.  Licence MIT.
