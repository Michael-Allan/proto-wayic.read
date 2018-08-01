/** readable - Way declarations that are readable on the web
  *
  *   See readable.css for a waycaster’s introduction.  The sections below are for programmers.
  *
  *
  * SUPPORTED BROWSERS
  * ------------------
  *   See README.html#browser_support
  *
  *
  * EXTENSION of HTML DOM
  * ---------------------
  *   This program adds one property to the Element interface, for internal purposes only.
  *
  *   Element
  *   -------
  *       interlinkScene · (boolean) Set on a waylink target node, answers whether this target node has
  *                        an interlink scene.  That is only its temporary use; later this property will
  *           instead point to the *scene* element that encodes the target node’s interlink scene.
  *
  *
  * FORMATION of SESSION HISTORY STATE
  * ----------------------------------
  *   This program alters the value of History.state.  There it maintains a hierarchy
  *   of Object properties which it calls ‘statelets’:
  *
  *       Formal name            Informal name
  *       --------------------   --------------------
  *       History
  *         state                Statelet root
  *           data:,wayic.read   Program statelet
  *             *                Subprogram statelets
  *             *
  *             ⋮                         * Formal names and sub-hierarchies omitted
  *
  *
  * INTRODUCTION of SPECIAL MARKUP
  * ------------------------------
  *   This program introduces its own markup to the document as outlined in the subsections below.
  *   Key to these outlines:
  *
  *       *          ∙ Any element in any namespace
  *       foo         ∙ Element ‘foo’ in namespace ‘data:,wayic.read’ *
  *       ns:foo       ∙ Element ‘foo’ in a given namespace †
  *           [attrib]   · Attribute of the element in namespace ‘data:,wayic.read’ *
  *           [:attrib]   · Attribute in no namespace
  *           [ns:attrib] · Attribute in a given namespace †
  *           ns:bar      · Child element ‘bar’ †
  *
  *                                       * The namespace defaults to NS_READ
  *                                       † Where *ns* is declared by an @namespace rule of readable.css
  *
  *   html:html ∙ Document element
  *   ---------
  *     [animatedShow] · Style rules that must animate or re-animate on each load of the document,
  *                      and on each revisit to it, must depend on this attribute.
  *     [lighting]      · Either ‘paper’ for black on white effects, or ‘neon’ for the reverse.
  *     [travelDelta]    · Travel distance in session history to reach the present entry
  *                        from the last entry of ours that was shown: -N, 0 or N
  *                        (backward by N entries, reload, or forward by N entries).  [OUR]
  *     [targetDirection] · (only if a node is on target, that is indicated by window.location.hash)
  *                         Direction to the on-target node from the source.
  *         Value  Meaning
  *         ·····  ·······································································
  *         self   Target and source node are identical
  *         up     Target is above the source node in document order
  *         down   Target is below the source node
  *         in     Intradocument travel by non-nodal source (e.g. bookmark or address bar)
  *         out    Extradocument travel (i.e. interdocument or from a non-document source)
  *
  *
  *   html:body
  *   ---------
  *     scene      ∙ Document scene
  *         [:id]   · ‘wayic.read.document_scene’
  *     scene        ∙ Interlink scene(s), if any.  There may be any number of these.
  *         [:class]  · ‘interlink’
  *       ⋮
  *
  *     offWayScreen · Overlay screen for off-way styling, q.v. in readable.css
  *
  *
  *   *
  *   -----
  *     [isOnWayBranch] · Whether this element, with all its descendants, is on way  [BA]
  *
  *
  *   * (as a) Wayscript element
  *   --------------------------
  *     [hasLeader]    · Has leading, non-whitespace text?  [BA]
  *     [hasShortName] · Has a visible name no longer than three characters?
  *     [isWaybit]    · Is a waybit?
  *     [isWayscript] · Is under a namespace whose identifier starts with ‘data:,wayscript.’?
  *
  *     eSTag       ∙ Start tag of an element, reproducing content that would otherwise be invisible
  *                   except in the wayscript source.
  *         eQName              ∙ Qualified name [XN] of the element.
  *             [isAnonymous]    · Has a local part that is declared to be anonymous?  [BA]
  *             ePrefix           ∙ Namespace prefix, if any.
  *                 [isAnonymous]  · Has a prefix that is declared to be anonymous?
  *             eName             ∙ Local part of the name.
  *
  *     textAligner ∙ (only if element is a step)
  *
  *
  *   html:a, Hyperlink source node
  *   ------
  *     [showsBreadcrumb] · Holds and prominently shows the breadcrumb for this entry of the session
  *                         history?  Set after travelling back in history onto this source node,
  *                         it reorients the user by highlighting his original point of departure.
  *                         Appears at most on one element.  [BA, FIB]
  *     [targetDirection] · Direction to the target node (‘up’ or ‘down’) if the link is
  *                         an intradocument link and unbroken (its target node exists).
  *
  *
  *   a, Waylink source node, Hyperform
  *   ----------------------
  *     html:a         ∙ (§ q.v.)
  *         [cog:link]  ·
  *     html:sup       ∙ Hyperlink indicator, containing ‘*’, ‘†’ or ‘‡’
  *
  *
  *   * (as a) Waylink source node, Bitform
  *   ----------------------------
  *     [hasPreviewString] · Has a non-empty preview of the target text?  [BA]
  *     [imaging]          · Indicates a form that might yet change.  Meantime it is either based on
  *                          a cached image of the target node (value ‘present’) or not (‘absent’).
  *     [isBroken] · Has a broken target reference?  [BA]
  *     [cog:link] ·
  *
  *     eSTag                  ∙ (q.v. under § Wayscript element)
  *     textAligner             ∙ (only if element is a step)
  *     forelinker               ∙ Hyperlink effector
  *         html:a                ∙ (§ q.v.)
  *             [targetDirection]  · (q.v. under § a § html:a)
  *             preview           ∙ Preview of the target text
  *             html:br           ∙
  *             verticalTruncator ∙ Indicating the source node as such (half a link)
  *                 html:span     ∙ Containing the visible indicator, exclusive of padding
  *
  *
  *   * (as a) Waylink target node
  *   ----------------------------
  *     [:id]               ·
  *     [isOrphan]           · Is waylink targetable, yet targeted by no waylink source node?
  *     [isWaylinkTargetable] · Iff this attribute is absent, then the answer is ‘no’; else its value
  *                             is either ‘on target’ or ‘off target’.  [FT in readable.css]
  *     [showsBreadcrumb]   · (q.v. under § html:a)
  *
  *     eSTag               ∙ (q.v. under § Wayscript element)
  *         html:div         ∙ Inway  [SH, ODO]
  *             [:class]      · ‘inway’
  *             svg:svg        ∙ Approach
  *                 [:class]    · ‘approach’
  *                 svg:circle   ∙ Edging
  *                     [:class]  · ‘edging’
  *                 svg:path     ∙ Path
  *             hall             ∙
  *                 icon          ∙ Target icon
  *                     html:span ∙ Holder of main content
  *                     bullseye  ∙ Dimensionless point centered on icon
  *
  *
  * NOTES  (continued at bottom)
  * -----
  */
'use strict';
console.assert( (eval('var _tmp = null'), typeof _tmp === 'undefined'),
  'Failed assertion: Strict mode is in effect' );
  // http://www.ecma-international.org/ecma-262/6.0/#sec-strict-mode-code
  // Credit Noseratio, https://stackoverflow.com/a/18916788/2402790
if( window.wayic      === undefined ) window.wayic      = {};
if( window.wayic.read === undefined ) window.wayic.read = {};
                                      window.wayic.read.readable = ( function()
{

    const expo = {}; // The public interface of this program



  /// ==================================================================================================
 ///  P u b l i c   i n t e r f a c e
/// ====================================================================================================


    /** The lighting style (aka ‘theme’) of the display, or null if none is yet set.  By default,
      * this program will set one of two lighting styles: either a black-on-white style called ‘paper’,
      * or a reverse video style called ‘neon’.  The choice it bases on what it can detect
      * of the browser’s settings, which it takes to be the user’s preference.
      *
      *     @return (string)
      *
      *     @see #setLightingStyle
      */
    expo.lightingStyle = function()
    {
        return document.documentElement/*html*/.getAttributeNS( NS_READ, 'lighting' );
    };



    /** Sets whether to enforce program constraints whose violations are expensive to detect.
      *
      *     @param to (boolean)
      *
      *     @see #toEnforceConstraints
      */
    expo.setEnforceConstraints = function( to ) { toEnforceConstraints = to? true: false; };



    /** Whether to enforce program constraints whose violations are expensive to detect.
      * The default is not to enforce them.  When enforced, a violation that is detected will cause
      * an exception to be thrown.
      *
      *     @return (boolean)
      *
      *     @see #setEnforceConstraints
      */
    expo.toEnforceConstraints = function() { return toEnforceConstraints; };


        let toEnforceConstraints = false;



    /** Sets the lighting style of the display, overriding the default.
      *
      *     @param lighting (string)
      *
      *     @see #lightingStyle
      */
    expo.setLightingStyle = function( lighting )
    {
        if( lighting === null ) throw NULL_PARAMETER;

        document.documentElement/*html*/.setAttributeNS( NS_READ, 'lighting', lighting )
    };



    /** Starts this program.
      */
    expo.start = function()
    {
      // Gross form
      // ----------
        transform();

      // Document shown, view stable in the typical case [TIC]
      // --------------
        ensureDocumentWillShow();
        if( LOAD_BREAKS_GROUND ) Viewporting.ensureTargetWillShow();

      // Processes launched, view may deflect in atypical cases
      // ------------------
        DocumentCachePersistor.start();
        InterdocScanner.start();
        InterdocWaylinkTransformer.start();
        WayTracer.start();
    };



  /// ==================================================================================================
 ///  P r e l i m i n a r y   d e c l a r a t i o n s
/// ====================================================================================================


    /** Whether the present document was requested from a 'file' scheme URL.
      */
    const wasRequestFileSchemed = document.URL.startsWith( 'file:' );



    /** Whether the user can likely edit the present document.
      */
    const isUserEditor = wasRequestFileSchemed;



    /** The XML namespace of markup specific to this project.
      */
    const NS_READ = 'data:,wayic.read';



    /** A copy of the statelet root for the present load of the document as captured at load time,
      * just prior to any initialization or modification of it.  Its value may be null.
      */
    const loadTimeHistoryState = history./*copy of*/state;



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



    /** The XML namespace of HTML.
      */
    const NS_HTML = 'http://www.w3.org/1999/xhtml';



   // ==================================================================================================
   //   U R I s


    /** Dealing with Uniform Resource Identifiers.
      *
      *     @see https://tools.ietf.org/html/rfc3986
      */
    const URIs = ( function()
    {

        const expo = {}; // The public interface of URIs



        /** Returns the same URI, but without a fragment.
          */
        expo.defragmented = function( uri )
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
        expo.FULL_PATTERN = new RegExp( '^[A-Za-z0-9][A-Za-z0-9+.-]*:' );



        /** Answers whether the given URI is detected to have an abnormal form,
          * where such detection depends on whether *toEnforceConstraints*.
          *
          *     @see #normalized
          */
        expo.isDetectedAbnormal = function( uri )
        {
            return toEnforceConstraints && uri !== expo.normalized(uri)
        };



        /** Returns a message that the given URI is not in normal form.
          */
        expo.message_abnormal = function( uri ) { return 'Not in normal form:' + uri; };



        /** Puts the given URI reference through the browser's hyperlink *href* parser,
          * thus converting any relative path to an absolute path (by resolving it against
          * the location of the present document) and otherwise normalizing its form.
          * Returns the normalized form.
          *
          *     @see URI-reference, https://tools.ietf.org/html/rfc3986#section-4.1
          */
        expo.normalized = function( ref )
        {
            // Modified from Matt Mastracci.
            // https://grack.com/blog/2009/11/17/absolutizing-url-in-javascript/
            //
            // Apparently this cannot be adapted for use with other documents, to normalize their own,
            // internally encoded references.  At least it fails when an equivalent function is
            // constructed (with parser element, etc.) against another document obtained through the
            // DocumentCache reading facility.  Then the *href* always yields the *undefined* value.
            //
            // FIX by moving to the more robust method of wayics.lex.
            // http://reluk.ca/project/wayic/lex/_/reader.js

            const div = hrefParserDiv;
            div.firstChild.href = ref; // Escaping ref en passant
            div.innerHTML = div.innerHTML; // Reparsing it
            return div.firstChild.href;
        };



       // - P r i v a t e ------------------------------------------------------------------------------


        const hrefParserDiv = document.createElementNS( NS_HTML, 'div' );

          hrefParserDiv.innerHTML = '<a/>';



        return expo;

    }() );



  /// ==================================================================================================
 ///  S i m p l e   d e c l a r a t i o n s   i n   l e x i c a l   o r d e r
/// ====================================================================================================



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



    const COMMENT_NODE = Node.COMMENT_NODE;



    /** Configures a bitform waylink source node for a given target node.
      *
      *     @param sourceNS (string) The namespace of the source node.
      *     @param sourceN (string) The local part of the source node's name.
      *     @param linkV (string) The value of the source node's *link* attribute.
      *     @param target (Element | TargetImage) The target node, or its cached image.
      *     @param transform (PartTransformC)
      */
    function configureForTarget( sourceNS, sourceN, linkV, target, transform )
    {
        const targetNS = target.namespaceURI;
        const targetN = target.localName;
        if( sourceNS !== targetNS )
        {
            tsk( 'Source node namespace (' + sourceNS + ') differs from target node namespace ('
              + targetNS + ') for waylink: ' + a2s('link',linkV) );
        }
        if( sourceN === ELEMENT_NAME_UNCHANGED ) transform.localPartOverride = targetN;
          // Transforming to the same name as the target
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
            source.removeAttributeNS( NS_READ, 'hasPreviewString' );
            preview.classList.remove( 'singleCharacterContent' ); // If present
        }
        else
        {
            source.setAttributeNS( NS_READ, 'hasPreviewString', 'hasPreviewString' );
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
        return URIs.normalized( loc ); // To be certain
    })();



    const DOCUMENT_NODE = Node.DOCUMENT_NODE;



    const DOCUMENT_POSITION_FOLLOWING = Node.DOCUMENT_POSITION_FOLLOWING;
    const DOCUMENT_POSITION_PRECEDING = Node.DOCUMENT_POSITION_PRECEDING;



    const DOCUMENT_SCENE_ID = NS_READ + '.document_scene';



    const ELEMENT_NODE = Node.ELEMENT_NODE;



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



    /** Ensures that the content of the document, which initially is invisible on load,
      * will become visible to the user.
      */
    function ensureDocumentWillShow()
    {
      // Place the off-way screen
      // ------------------------
        const body = document.body;
        body.appendChild( document.createElementNS( NS_READ, 'offWayScreen' ));

      // Ensure a lighting style is set  (cf. expo.setLightingStyle)
      // -----------------------
        const html = document.documentElement;
        if( !html.hasAttributeNS( NS_READ, 'lighting' ))
        {
          // Detect user's lighting preference, or guess it
          // ---------------------------------
            let lighting;
            let defaultTextColour = getComputedStyle(body).getPropertyValue( 'color' );
              // Using 'color' here because somehow 'background-color' fails;
              // it reads as transparent (Firefox) or black (Chrome), when really it is white.
            const cc = defaultTextColour.match( /^\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/ );
            if( cc !== null )
            {
                const red = cc[1], green = cc[2], blue = cc[3]; // Each 0-255
                const luma = red * 299 + green * 587 + blue * 114; // 0-255,000, perceived brightness
                  // formula: https://en.wikipedia.org/wiki/YIQ
                lighting = luma < 127500? 'paper':'neon';
            }
            else lighting = 'paper'; // Defaulting to what is most popular

          // Set lighting switch
          // -------------------
            html.setAttributeNS( NS_READ, 'lighting', lighting );
        }

      // Enable display of the document
      // --------------
        body.style.setProperty( 'display', 'block' ); // Overriding readable.css 'none'

      // Run page-show animations on load
      // ------------------------
        html.setAttributeNS( NS_READ, 'animatedShow', 'animatedShow' );

      // Restart page-show animations on each revisit [PSA]
      // ----------------------------
        addEventListener( 'pageshow', ( /*PageTransitionEvent*/e ) => // Load or revisit
        {
            if( !/*revisit*/e.persisted ) return;

            html.removeAttributeNS( NS_READ, 'animatedShow' );
            requestAnimationFrame( (()=> { requestAnimationFrame( (()=>
            {
                html.setAttributeNS( NS_READ, 'animatedShow', 'animatedShow' );
            })); }));
        });
        addEventListener( 'pagehide', ( /*PageTransitionEvent*/e ) =>
        {
            if( /*might later revisit*/e.persisted ) html.removeAttributeNS( NS_READ, 'pageShowCount' );
        });
    }



    /** The allowance for rounding errors and other imprecisions in graphics rendering.
      */
    const GRAPHICAL_ERROR_MARGIN = 0.01;



    /** The symbol to indicate a hyperlink.  It is styled as superscript.
      */
    const HYPERLINK_SYMBOL = '*'; // Unicode 2a (asterisk)

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
        do { node = node.lastChild } while( node.hasChildNodes() );
        return node;
    }



    /** Whether it appears that the user would be unable to correct faults in this program.
      */
    const isUserNonProgrammer = !wasRequestFileSchemed;



    /** Answers whether the present load of the document has extended the session history,
      * breaking new ground there by adding at least one new entry.  (Multiple entries may be added
      * by a single load owing to intradocument travel.)  A reload never breaks new ground.
      */
    const LOAD_BREAKS_GROUND = ( ()=>
    {
        if( loadTimeHistoryState === null ) return true;

        const sP = loadTimeHistoryState[NS_READ];
        if( sP === undefined ) return true;

        return sP.Breadcrumbs === undefined;
    })();



    const MALFORMED_PARAMETER = 'Malformed parameter';



    /** Delay in milliseconds before the first delayed procedure of Inways.
      */
    const MS_DELAY_INWAYS = 49;

    /** Delay in milliseconds before the first delayed procedure of InterdocWaylinkTransformer.
      */
    const MS_DELAY_IWT = MS_DELAY_INWAYS + 142;

    /** Delay in milliseconds before the first delayed procedure of DocumentCachePersistor.
      */
    const MS_DELAY_DCP = MS_DELAY_IWT + 1991;



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



    /** @see JSON#stringify
      */
    const SESSION_STRINGIFY_SPACING = 1; /* Improving the readability of stored content at little cost,
      given that the session's storage space is practically unbounded. */



    /** Tests whether the given *id* attribute declaration is well formed for the purpose of waylinkage.
      * Returns true if it is well formed, otherwise reports it as malformed and returns false.
      *
      *     @param t (Element) A waylink target node.
      *     @param id (string) The value of t's *id* attribute.
      */
    function testWaylinkIdForm( t, id )
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
            tsk( 'Malformed *id* declaration, value not unique: ' + a2s('id',id), doc );
        }
        return isWellFormed;
    }



    const TEXT_NODE = Node.TEXT_NODE;



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
        const scene = body.appendChild( document.createElementNS( NS_READ, 'scene' ));
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
                if( node.namespaceURI === NS_READ ) return NodeFilter.FILTER_REJECT; /* Bypassing this
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
                t.setAttributeNS( NS_READ, 'isWayscript', 'isWayscript' );
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


          // ============
          // Hyperlinkage by element t
          // ============
            hyperlinkage: if( isHTML && tN === 'a' )
            {
                let href = t.getAttribute( 'href' );
                const linkV = t.getAttributeNS( NS_COG, 'link' );
                let targetExtradocLocN; // Or empty string, as per TargetWhereabouts.documentLocationN
                if( href !== null ) // Then t is a generic hyperlink
                {
                    if( linkV !== null )
                    {
                        tsk( 'An *a* element with both *href* and *link* attributes: '
                          + a2s('href',href) + ', ' + a2s('link',link) );
                    }
                    if( href.startsWith( '/' )) t.setAttribute( 'href', href = CAST_BASE_REF + href );
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
                        break hyperlinkage;
                    }

                    link.hrefTo( t );
                    const targetWhereabouts = TargetWhereabouts.fromSource( t, link );
                    targetExtradocLocN = targetWhereabouts.documentLocationN;
                    const direction = targetWhereabouts.direction;
                    if( direction !== null ) t.setAttributeNS( NS_READ, 'targetDirection', direction );
                }
                if( targetExtradocLocN.endsWith( '/way.xht' )) // Likely a way declaration document.
                {                                             // So tell the transformer:
                    InterdocWaylinkTransformer.noteTargetDocument( targetExtradocLocN );
                }

              // Superscripting
              // --------------
                const aWrapper = document.createElementNS( NS_READ, 'a' );
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
                const textAligner = document.createElementNS( NS_READ, 'textAligner' );
                t.insertBefore( textAligner, t.firstChild );
            }
            if( isBit ) t.setAttributeNS( NS_READ, 'isWaybit', 'isWaybit' );
            const partTransform = new PartTransformC( t );


          // ==================
          // Bitform waylinkage of element t
          // ==================
            const lidV = ( ()=> // Target identifier, non-null if t is a potential waylink target node
            {
                if( !isBit ) return null;

                const v = t.getAttribute( 'id' );
                if( v && testWaylinkIdForm(t,v) ) return v;

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

                const forelinker = t.appendChild( document.createElementNS( NS_READ, 'forelinker' ));
                const a = forelinker.appendChild( document.createElementNS( NS_HTML, 'a' ));
                link.hrefTo( a );
                const targetWhereabouts = TargetWhereabouts.fromSource( t, link );
                let targetPreviewString;
                targeting:
                {
                    const targetDocLocN = targetWhereabouts.documentLocationN;
                    if( targetDocLocN.length > 0 ) // Then *t* links to a separate document
                    {
                        const registration = InterdocWaylinkTransformer.registerBitformLink( t,
                          link.targetID, targetDocLocN );
                        const image = registration.targetImage;
                        if( image === null )
                        {
                            partTransform.imaging = 'absent';
                            targetPreviewString = '⌚'; // Unicode 231a (watch) = pending symbol
                        }
                        else
                        {
                            partTransform.imaging = 'present';
                            targetPreviewString = image.leader;
                            configureForTarget( tNS, tN, linkV, image, partTransform );
                        }
                        break targeting;
                    }

                    const direction = targetWhereabouts.direction;
                    if( direction === null ) // Then *t* is a broken waylink
                    {
                        targetPreviewString = BREAK_SYMBOL;
                        t.setAttributeNS( NS_READ, 'isBroken', 'isBroken' );
                        break targeting;
                    }

                    // The target is within the present document
                    a.setAttributeNS( NS_READ, 'targetDirection', direction );
                    const target = targetWhereabouts.target;
                    configureForTarget( tNS, tN, linkV, target, partTransform );
                    LeaderReader.read( target );
                    targetPreviewString = LeaderReader.leader;
                }
                const preview = a.appendChild( document.createElementNS( NS_READ, 'preview' ));
                preview.appendChild( document.createTextNode( targetPreviewString ));
                configureForTargetPreview( t, preview, targetPreviewString );
                a.appendChild( document.createElementNS( NS_HTML, 'br' ));
                a.appendChild( document.createElementNS( NS_READ, 'verticalTruncator' ))
                 .appendChild( document.createElementNS( NS_HTML, 'span' ))
                 .appendChild( document.createTextNode( '⋱⋱' ));
                    // '⋱' is Unicode 22f1 (down right diagonal ellipsis)
            }


         // =========
         // Start tag of element t
         // =========
            if( tSubNS === SUB_NS_COG && tN === 'group' )
            {
                partTransform.localPartOverride = ''; // Emptied to accomodate text shipment, q.v. below
                partTransform.run();

              // Qualifying text for the group
              // ---------------
                console.assert( LeaderReader.element === t, A );
                if( LeaderReader.hasLeader ) // Then ship it into the start tag, for sake of alignment
                {
                    let n;
                    function isSafeToMove()
                    {
                        const type = n.nodeType;
                        return type === TEXT_NODE || type === COMMENT_NODE
                          || type === ELEMENT_NODE && n.namespaceURI === NS_HTML
                                                   && willDisplayInLine_likely( n );
                    }
                    const eSTag = partTransform.eSTag;
                    const eQName = asElementNamed( 'eQName', eSTag.firstChild );
                    for( n = eSTag.nextSibling; n != null && isSafeToMove(); n = n.nextSibling )
                    {
                        eQName.appendChild( n );
                    }
                }
                continue tt;
            }

            partTransform.run();
            if( lidV !== null ) // Then t is waylink targetable
            {
                t.setAttributeNS( NS_READ, 'isWaylinkTargetable',
                  lidV === Hyperlinkage.idOnTarget()? 'on target':'off target' );
                t.setAttributeNS( NS_READ, 'isOrphan', 'isOrphan' ); // Till proven otherwise
                const eSTag = partTransform.eSTag;

              // Inway
              // -----
                const inway = eSTag.appendChild( document.createElementNS( NS_HTML, 'div' ));
                inway.setAttribute( 'class', 'inway' );
                inway.appendChild( Approaches.newApproach() );
                const icon = inway.appendChild( document.createElementNS( NS_READ, 'hall' ))
                                  .appendChild( document.createElementNS( NS_READ, 'icon' ));
                icon.appendChild( document.createElementNS( NS_HTML, 'span' ))
                    .appendChild( document.createTextNode( '│' ));
                      // Unicode 2502 (box drawings light vertical)
                icon.appendChild( document.createElementNS( NS_READ, 'bullseye' ));
                Inways.layWhen( inway, eSTag );

              // -----
                TargetControl.addControls( eSTag );
            }
        }
    }



    /** Reports a fault that a user with write access to the present document might be able to correct,
      * such as malformed wayscript.
      *
      *     @param report (string)
      *     @param doc (Document) The document at fault.  Typically this parameter is left undefined.
      *       Otherwise a value that is unequal to the present document will defeat the function call,
      *       causing no report to be sent.
      */
    function tsk( report, doc )
    {
        if( report === null ) throw NULL_PARAMETER;

        if( doc !== undefined )
        {
            if( doc.nodeType !== DOCUMENT_NODE ) throw MALFORMED_PARAMETER;

            if( doc !== document ) return;
        }

        console.error( report );
        if( isUserEditor ) alert( report ); // See readable.css § TROUBLESHOOTING
    }



    /** The empty string as a parameter for CSSStyleDeclaration.setProperty,
      * which instead has the effect of *removeProperty*.
      *
      *     @see https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-setproperty
      */
    const UNSET_STYLE = '';



    /** Answers whether the given HTML element is very likely to be displayed in line by the browser.
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
/// ====================================================================================================



    /** Dealing with *approaches*.  The *approach* is an inway component that draws vector graphics
      * for a waylink target node and controls the scene switching for it.
      *
      *             approach path
      *     ● ━━━━━━━━━━━━━━━━━━━━━━━━━━━
      *      ╲
      *      edging
      *
      * @see Inways
      */
    const Approaches = ( function()
    {

        const expo = {}; // The public interface of Approaches

        // Dimensions and coordinates are here given in pixels, except where marked otherwise.



        /** The smallest width in which an *approach* can correctly draw itself.
          */
        expo.minimumWidth = function() { return MIN_WIDTH; };



        /** Constructs an inway *approach*.
          */
        expo.newApproach = function()
        {
            const approach = document.createElementNS( NS_SVG, 'svg' );
            approach.setAttribute( 'class', 'approach' );
         // approach.addEventListener( 'resize', (_UIEvent)=>{expo.redraw(approach);} );
              // Ensuring it draws when first laid, then redraws as needed.
              //
              // Except it is not called.  Likewise for event name 'SVGResize' and attribute *onresize*.
              // Maybe embedded svg elements such as this are not considered "outermost svg elements"?
              // https://www.w3.org/TR/SVG11/interact.html#SVGEvents
              //
              // As a workaround, Inways calls *redraw* directly.
            const edging = approach.appendChild( document.createElementNS( NS_SVG, 'circle' ));
            edging.setAttribute( 'class', 'edging' );
            approach.appendChild( document.createElementNS( NS_SVG, 'path' )); // Approach path
            return approach;
        };



        /** Draws or redraws the given *approach*.
          *
          *     @param approach (SVGSVGElement)
          */
        expo.redraw = function( approach, width, height )
        {
         // const bounds = approach.getBBox(); /* The actual bounds within the larger document.
         //   These define the coordinate system of the drawing because the *approach* (*svg* element)
         //   declares no *viewBox*.  Therefore the default unit (SVG 'user unit') is pixels. */
         // const width = bounds.width;
         // const height = bounds.height;
         /// That failed, now they're given as parameters instead

          // Draw the approach path
          // ----------------------
            const midY = height / 2; // Vertically centered
            {
                const path = asElementNamed( 'path', approach.lastChild );
                const endX = width - width / 4;
                let display;
                if( endX - GAP >= PATH_MIN_LENGTH )
                {
                    path.setAttribute( 'd',
                      // [PD]     X             Y
                      //        ------         ----
                         'M ' + GAP + ' ' + midY
                      + ' H ' + endX
                      );
                    display = UNSET_STYLE; // To whatever it was
                }
                else display = 'none'; // Too short
                path.style.setProperty( 'display', display );
            }

          // Draw the edging
          // ---------------
            const mark = asElementNamed( 'circle', approach.firstChild );
            mark.setAttribute(  'r', EDGE_MARK_RADIUS + 'px' );
            mark.setAttribute( 'cx', EDGE_MARK_RADIUS + 'px' ); // Abutting the document edge
            mark.setAttribute( 'cy', midY + 'px' );
        };



       // - P r i v a t e ------------------------------------------------------------------------------


        /** The gap between the edging and the path to its right.
          */
        const GAP = 2/*rem*/ * REM;



        const EDGE_MARK_WIDTH = 0.3/*rem*/ * REM;
        const EDGE_MARK_RADIUS = EDGE_MARK_WIDTH / 2;



        const MIN_CLICK_WIDTH_REM = 0.8; // Changing? sync'd → readable.css



        const MIN_WIDTH = MIN_CLICK_WIDTH_REM * REM;

            { console.assert( EDGE_MARK_WIDTH - MIN_WIDTH <= GRAPHICAL_ERROR_MARGIN, A ); }



        const PATH_MIN_LENGTH = GAP;



        return expo;

    }() );



   // ==================================================================================================
   //   B r e a d c r u m b s


    /** Cueing for the purpose of user reorientation after hyperlink back travel.  For this purpose
      * are maintained, in subprogram statelet 'Breadcrumbs', the following properties:
      *
      *     sourcePath · Identifier (string in XPath form) of the hyperlink source node
      *                  whose activation caused the last exit from the present entry
      *                  of the session history; or null if the present entry was never exited,
      *                       or its last exit had some other cause.
      *     targetDirection · Q.v. under § INTRODUCTION of SPECIAL MARKUP § html:html
      *     travel          · Ordinal (number) of the present entry within the session history,
      *                       a number from zero (inclusive) to the history length (exclusive).
      *
      * @see § FORMATION of SESSION HISTORY STATE
      */
    const Breadcrumbs = ( function()
    {

        const expo = {}; // The public interface of Breadcrumbs



        /** @param s (Element) The element that determines the position of the dropped crumb,
          *   typically a hyperlink source node.
          */
        expo.dropCrumb = function( s )
        {
            travelStop.sourceNode = s;
            dropCrumb_store( definitePath(s) );
            if( crumbShower === s ) return; // None is showing, or none other than *s*

            hideCrumb(); // Removed above and dropped on *s*, it is no longer where it appears to be
        };


            function dropCrumb_store( p ) // p → statelet property Breadcrumbs.sourcePath
            {
                const state = history./*copy of*/state;
                console.assert( state !== null, A ); // Assured by *reorient*
                const statelet = state[NS_READ].Breadcrumbs;
                console.assert( statelet !== undefined, A ); // Assured by *reorient*
                if( statelet.sourcePath === p ) return; // Already stored

                statelet.sourcePath = p;
                history.replaceState( state, /*no title*/'' );
            }



       // - P r i v a t e ------------------------------------------------------------------------------


        /** The element (Element) on which attribute *showsBreadcrumb* is set, or null if there is none.
          */
        let crumbShower = null;



        /** Constructs an XPath locator of the given element that is unambiguous within the context
          * of the present document.
          *
          *     @param element (Element)
          *     @return (string)
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



        /** @param click (MouseEvent) A click event from within the document element.
          */
        function hearClick/* event handler */( click )
        {
            for( let t = click.target;; t = t.parentNode )
            {
                if( t.namespaceURI !== NS_HTML ) continue;

                const tN = t.localName;
                if( tN === 'body' || tN === 'html' ) break;

                if( tN !== 'a'/*hyperlink source node*/ ) continue;

                if( !t.hasAttribute( 'href' )) break; // Dud link

              // Drop a crumb before traversing the hyperlink
              // ------------
                expo.dropCrumb( t );
                return;
            }

            hideCrumb(); /* This click (which is not a hyperlink activation)
              might be an attempt to hide a previously dropped crumb that is showing. */
        }



        function hideCrumb() // If any is showing
        {
            if( crumbShower === null ) return;

            crumbShower.removeAttributeNS( NS_READ, 'showsBreadcrumb' );
            crumbShower = null;
        }



        /** Session storage key (string) for the ordinal (in string form) of the last entry shown.
          */
        const SS_KEY_travelLast = NS_READ + '.Breadcrumbs.travelLast';



        const ORDERED_NODE_ITERATOR_TYPE = XPathResult.ORDERED_NODE_ITERATOR_TYPE;



        /** Reorient after travel.
          *
          *     @param state (Object) The value of History.state subsequent to the change.
          */
        function reorient( state )
        {
            // Copied in part to https://stackoverflow.com/a/49329267/2402790

            const statelet = ( ()=> // state[NS_READ].Breadcrumbs
            {
              // Create this subprogram statelet, if necessary
              // -------------------------------
                if( state === null ) return (( state = {} )[NS_READ] = {} ).Breadcrumbs = {};

                let s;
                s = state[NS_READ];
                if( s === undefined ) return ( state[NS_READ] = {} ).Breadcrumbs = {};

                s = s.Breadcrumbs;
                if( s === undefined ) return s.Breadcrumbs = {};

                return s;
            })();
            travel = statelet.travel;
            if( travel === undefined ) // Then this entry is new to the session history
            {
                const historyLength = history.length;
                travel = historyLength - 1; // Last entry of session history

              // Sync → travelStops
              // ------------------
                travelStops.length = historyLength;
                travelStops[travel] = travelStop = new TravelStop();

              // Initialize the subprogram statelet
              // ----------------------------------
                statelet.sourcePath = null; // Properly formed, as per Breadcrumbs contract
                statelet.travel = travel;
                statelet.targetDirection = ( ()=>
                {
                    Hyperlinkage.refresh();
                    const elementOnTarget = Hyperlinkage.elementOnTarget();
                    if( elementOnTarget === null ) return null;

                    const previousStop = travelStops[travel-1];
                    if( previousStop === undefined ) return 'out';

                    const sourceNode = previousStop.sourceNode;
                    if( sourceNode === null )  return 'in';

                    if( sourceNode === elementOnTarget ) return 'self';

                    const dP = sourceNode.compareDocumentPosition( elementOnTarget );
                    if( dP & DOCUMENT_POSITION_PRECEDING ) return 'up';

                    console.assert( dP & DOCUMENT_POSITION_FOLLOWING, A );
                    return 'down';
                })();
                history.replaceState( state, /*no title*/'' );
            }
            else // This entry was pre-existing
            {
              // Sync → travelStops
              // ------------------
                travelStop = travelStops[travel];
                if( travelStop === undefined ) travelStops[travel] = travelStop = new TravelStop();
            }

          // Mark the travel delta
          // ---------------------
            const html = document.documentElement;
            const delta = ( ()=>
            {
                const s = sessionStorage.getItem( SS_KEY_travelLast ); // [FSS]
             // console.assert( s !== null, A ); /* This entry in the session history is revisited
             //   ∵ travel !== undefined.  ∴ at least one entry of ours was previously visited.
             //   But each entry (of ours) stores *s*.  How then could *s* be null?  [OUR] */
             /// Yet it is null on return from HTTP document to file-scheme document (Firefox 60)
                const travelLast = Number( s );
                return travel - travelLast;
            })();
            html.setAttributeNS( NS_READ, 'travelDelta', delta );

          // Stamp the session with the ordinal of the last entry shown, which is now this entry
          // -----------------
            sessionStorage.setItem( SS_KEY_travelLast, String(travel) );

          // Mark the target direction
          // -------------------------
            {
                const d = statelet.targetDirection;
                if( d === null ) html.removeAttributeNS( NS_READ, 'targetDirection' );
                else html.setAttributeNS( NS_READ, 'targetDirection', d );
            }

          // Ensure a crumb is showing or not, as appropriate
          // -------------------------
            sC:
            {
                if( delta >= 0 )
                {
                    hideCrumb();
                    break sC;
                }

                const p = statelet.sourcePath;
                if( p === null )
                {
                    hideCrumb();
                    break sC;
                }

                const pR = document.evaluate( p, document, /*namespace resolver*/null,
                  ORDERED_NODE_ITERATOR_TYPE, /* XPathResult to reuse*/null );
                const s = pR.iterateNext(); // Resolved hyperlink source node
                console.assert( pR.iterateNext() === null, A ); /* At most there is the one
                  if *definitePath* is unambiguous, as claimed and required. */
                if( crumbShower === s ) break sC;

              // Show crumb
              // ----------
                hideCrumb(); // Removing it from present *crumbShower*, if any
                s.setAttributeNS( NS_READ, 'showsBreadcrumb', 'showsBreadcrumb' );
                crumbShower = s;
            }
        }



        /** Ordinal (number) of the present entry within the session history,
          *
          *     @see Statelet property Breadcrumbs.travel
          */
        let travel;



        /** The present stop in session history.
          */
        let travelStop;



        class TravelStop
        {

            constructor() { this._sourceNode = null; }


            /** The hyperlink source node whose activation caused the last exit from this stop.
              * This is null if the stop was never exited during the present load of the document,
              * or its last exit had some other cause.
              *
              *     @see Statelet property Breadcrumbs.sourcePath
              */
            get sourceNode() { return this._sourceNode; }
            set sourceNode( _ ) { this._sourceNode = _; }

        }



        /** Sparse array of stops in session history.  Stored at index *travel* are the present stop
          * and, contiguous with it, all other stops accessible to the present load of the document.
          */
        const travelStops = [];



        document.documentElement.addEventListener( 'click', hearClick );
        addEventListener( 'pageshow', ( _PageTransitionEvent ) => // Document load or revisit
        {
            reorient( history./*copy of*/state ); // Firefox can have the wrong value here [FHS]
        });
        addEventListener( 'popstate', ( /*PopStateEvent*/pop ) => // Intradocument travel
        {
            reorient( pop.state );
        });
        addEventListener( 'pagehide', ( /*PageTransitionEvent*/e ) =>
        {
            if( travelStop.sourceNode === null )
            {
                dropCrumb_store( null ); /* Clear any *sourcePath* from the statelet
                  because this exit is not caused by a hyperlink activation. */
                if( /*might later revisit*/e.persisted ) hideCrumb();
            }
        });
        return expo;

    }() );



   // ==================================================================================================
   //   D o c u m e n t   C a c h e


        class DocumentCacheEntry
        {


            /** Constructs a DocumentCacheEntry.
              *
              *     @see #document
              *     @see #location
              *     @see #readers
              */
            constructor( document, location, readers )
            {
                this._document = document;
                this._location = location;
                this._readers = readers;
            }



            /** The cached document, or null if document storage is pending or failed.
              *
              *     @return (Document)
              */
            get document() { return this._document; }
            set document( _ ) { this._document = _; }



            /** The location of the document in normal URL form.
              *
              *     @return (string)
              *     @see URIs#normalized
              */
            get location() { return this._location; }



            /** The readers to notify of document storage.
              * This property is nulled when notification commences.
              *
              *     @return (Array of DocumentReader)
              */
            get readers() { return this._readers; }
            set readers( _ ) { this._readers = _; }


        }



    /** Store of way declaration documents, including the present document.
      */
    const DocumentCache = ( function()
    {

        const expo = {}; // The public interface of DocumentCache

        // Changing?  sync'd → http://reluk.ca/project/wayic/lex/_/reader.js



        /** Registers a reader of all cached documents.  Immediately the reader is given all entries
          * whose processing is complete; then later any newly completed entries, each as it completes.
          *
          *     @param r (DocumentReader)
          */
        expo.addOmnireader = function( r )
        {
            for( const entry of entryMap.values() )
            {
                if( entry.readers === null ) notifyReader( r, entry );
            }
            omnireaders.push( r );
        };



        /** @return (Iterator of DocumentCacheEntry)
          */
        expo.entries = function() { return entryMap.values(); };



        /** Gives the indicated document to the reader.  If already the document is stored,
          * then immediately it calls reader.read, followed by reader.close.
          *
          * Otherwise this function starts a storage process and returns.  If the process eventually
          * succeeds, then it calls reader.read.  Regardless it ends by calling reader.close.
          *
          *     @param docLoc (string) The document location in normal URL form.
          *     @param reader (DocumentReader)
          *
          *     @see URIs#normalized
          */
        expo.readNowOrLater = function( docLoc, reader )
        {
            if( URIs.isDetectedAbnormal( docLoc )) throw URIs.message_abnormal( docLoc );

            let entry = entryMap.get( docLoc );
            if( entry !== undefined ) // Then the document was already requested
            {
                const readers = entry.readers;
                if( readers !== null ) readers.push( reader );
                else notifyReader( reader, entry );
                return;
            }

            const readers = [];
            entry = new DocumentCacheEntry( /*document*/null, docLoc, readers );
            readers.push( reader );
            entryMap.set( docLoc, entry );

          // ===================
          // Configure a request for the document
          // ===================
            const req = new XMLHttpRequest();
            req.open( 'GET', docLoc, /*async*/true ); // Misnomer; opens nothing, only sets config
         // req.overrideMimeType( 'application/xhtml+xml' );
         /// Still it parses to an XMLDocument (Firefox 52), unlike the present document
            req.responseType = 'document';
            req.timeout = docLoc.startsWith('file:')? 2000: 8000; // ms

          // ===========
          // Stand ready to catch the response
          // ===========
            req.onabort = ( _event/*ignored*/ ) =>
            {
                console.warn( 'Document request aborted: ' + docLoc );
            };
            req.onerror = ( _event/*ignored*/ ) =>
            {
                // Parameter *_event* is a ProgressEvent, at least on Firefox,
                // which contains no useful information on the specific cause of the error.

                console.warn( 'Document request failed: ' + docLoc );
            };
            req.onload = ( event ) =>
            {
                // If this listener is registered instead by req.addEventListener,
                // then the file scheme workaround fails for Firefox (52),
                // even for intra-directory requests. [SPF in readable.css]

                const doc = event.target.response;
                entry.document = doc;

              // Test *id* declarations
              // ----------------------
                const traversal = doc.createNodeIterator( doc, SHOW_ELEMENT );
                for( traversal.nextNode()/*onto the document node itself*/;; )
                {
                    const t = traversal.nextNode();
                    if( t === null ) break;

                    const id = t.getAttribute( 'id' );
                    if( id !== null ) testWaylinkIdForm( t, id );
                }
            };
            req.onloadend = ( _event/*ignored*/ ) =>
            {
                // Parameter *_event* is a ProgressEvent, at least on Firefox, which contains
                // no useful information.  If more information is ever needed, then it might
                // be obtained from req.status, or the fact of a call to req.onerror, above.

              // Notify the waiting readers
              // --------------------------
                const readers = entry.readers;
                entry.readers = null;
                for( const r of     readers ) notifyReader( r, entry );
                for( const r of omnireaders ) notifyReader( r, entry );
                noteReadersNotified( entry );
            };
            req.ontimeout = ( e ) =>
            {
                console.warn( 'Document request timed out: ' + docLoc );
            };

          // ================
          // Send the request
          // ================
            req.send();
        };



       // - P r i v a t e ------------------------------------------------------------------------------


        /** Map of document entries (DocumentCacheEntry) keyed by DocumentCacheEntry#location.
          */
        const entryMap = new Map();



        function noteReadersNotified( entry ) { DocumentCachePersistor.noteReadersNotified( entry ); }



        function notifyReader( r, entry )
        {
            const doc = entry.document;
            if( doc !== null ) r.read( entry, doc );
            r.close( entry );
        }


        const omnireaders = [];



        entryMap.set( DOCUMENT_LOCATION, // Storing the present document
          new DocumentCacheEntry( document, DOCUMENT_LOCATION, /*readers*/null ));
        return expo;

    }() );



   // ==================================================================================================
   //   D o c u m e n t   C a c h e   P e r s i s t o r


    /** A device that persists the document cache from load to load throughout the session.
      *
      *     @see DocumentCache
      */
    const DocumentCachePersistor = ( function()
    {

        const expo = {}; // The public interface of DocumentCachePersistor



        /** Registers a reader of all documents that are cached during the session.
          * A call to this function is the same as a call to DocumentCache.addOmnireader,
          * except that it documents the caller's need of a session persistent cache.
          *
          *     @param r (DocumentReader)
          *     @see DocumentCache#addOmnireader
          */
        expo.addOmnireader = function( r ) { DocumentCache.addOmnireader( r ); };



        /** @param cacheEntry (DocumentCacheEntry)
          */
        expo.noteReadersNotified = function( cacheEntry ) { ensureMemorizationPending(); }; // [RPP]



        /** Starts this persistor.
          */
        expo.start = function()
        {
            let isPresentDocumentMemorized = false;

          // Recall any documents from session memory
          // ------
            const s = sessionStorage.getItem( SS_KEY_locations );
            if( s !== null )
            {
                const locations = JSON.parse( s );

              // Recache the recalled documents
              // -------
                for( const loc of locations )
                {
                    if( !isPresentDocumentMemorized && loc === DOCUMENT_LOCATION )
                    {
                        isPresentDocumentMemorized = true;
                        continue; // Always the present document is already cached
                    }

                    DocumentCache.readNowOrLater( loc, DOCUMENT_READER_NULL ); // Recaching it
                }
            }

          // Initiate memorization of the present document, if yet unmemorized
          // --------
            if( !isPresentDocumentMemorized ) ensureMemorizationPending();
              // ∵ No call to *noteReadersNotified* is assured for the present document
        };



       // - P r i v a t e ------------------------------------------------------------------------------


        function ensureMemorizationPending()
        {
            if( isMemorizationPending ) return;

            setTimeout( ()=> // No hurry, go easy here on the machine
            {
                isMemorizationPending = false;

              // Memorize the cached documents
              // --------
                const locations = [];
                for( const cacheEntry of DocumentCache.entries() )
                {
                    if( cacheEntry.document !== null ) locations.push( cacheEntry.location );
                }
                sessionStorage.setItem( SS_KEY_locations,
                  JSON.stringify( locations, /*replacer*/null, SESSION_STRINGIFY_SPACING ));
            }, MS_DELAY_DCP );
            isMemorizationPending = true;
        }



        let isMemorizationPending = false;



        /** Session storage key (string) for memorized document locations
          * (JSON stringified Array of string).
          */
        const SS_KEY_locations = NS_READ + '.DocumentCachePersistor.locations';



        return expo;

    }() );



   // ==================================================================================================
   //   D o c u m e n t   R e a d e r


    /** A reader of documents.
      */
    class DocumentReader
    {

        /** Closes this reader.
          *
          *     @param cacheEntry (DocumentCacheEntry)
          */
        close( cacheEntry ) {}


        /** Reads the document.
          *
          *     @param cacheEntry (DocumentCacheEntry)
          *     @param doc (Document)
          */
        read( cacheEntry, doc ) {}

    }



    /** A document reader that does nothing.
      */
    const DOCUMENT_READER_NULL = new DocumentReader();



   // ==================================================================================================
   //   H y p e r l i n k a g e


    /** Dealing with hyperlinks.
      */
    const Hyperlinkage = ( function()
    {

        const expo = {}; // The public interface of Hyperlinkage



        /** The element that is actively hyperlink-targeted by the browser, or null if there is none.
          *
          *     @return (Element)
          *     @see #idOnTarget
          */
        expo.elementOnTarget = function() { return elementOnTarget; };


            let elementOnTarget = null;


            function clearElementOnTarget()
            {
                if( elementOnTarget === null ) return;

                if( elementOnTarget.hasAttributeNS( NS_READ, 'isWaylinkTargetable' ))
                {
                    elementOnTarget.setAttributeNS( NS_READ, 'isWaylinkTargetable', 'off target' );
                }
                elementOnTarget = null;
            }


            function setElementOnTarget( e )
            {
                if( elementOnTarget === e ) return;

                if( elementOnTarget !== null
                 && elementOnTarget.hasAttributeNS( NS_READ, 'isWaylinkTargetable' ))
                {
                    elementOnTarget.setAttributeNS( NS_READ, 'isWaylinkTargetable', 'off target' );
                }
                if( e.hasAttributeNS( NS_READ, 'isWaylinkTargetable' ))
                {
                    e.setAttributeNS( NS_READ, 'isWaylinkTargetable', 'on target' );
                }
                elementOnTarget = e;
            }



        /** The element identifier that is actively hyperlink-targeted by the browser, as obtained from
          * the fragment part of window.location without the preceding delimiter character '#'.
          * If the fragment part is missing, then the return value is null.
          *
          *     @return (string)
          *     @see #elementOnTarget
          */
        expo.idOnTarget = function() { return idOnTarget; };


            let idOnTarget = null;



        /** Immediately updates the Hyperlinkage state, rather than wait for an event
          * that might yet be pending.
          */
        expo.refresh = function() { hearHashChange.call( /*this*/window ); };



       // - P r i v a t e ------------------------------------------------------------------------------


        function hearHashChange/* event handler */( _HashChangeEvent )
        {
            const hash = location.hash; // [WDL]
            const id = hash.length === 0? null: hash.slice(1);
            if( idOnTarget === id ) return; // Redundant call owing to use of *refresh*

            idOnTarget = id;
            if( id !== null )
            {
                const e = document.getElementById( id );
                if( e !== null )
                {
                    setElementOnTarget( e );
                    return;
                }
            }

            clearElementOnTarget();
        }



        window.addEventListener( 'hashchange', hearHashChange );
        expo.refresh(); // Initializing
        return expo;

    }() );



   // ==================================================================================================
   //   I n t e r d o c   S c a n n e r


    /** A scanner of related documents.  It discovers related documents, scans them for references
      * to the present document, and updates the form of the present document based on the results.
      */
    const InterdocScanner = ( function()
    {

        const expo = {}; // The public interface of InterdocScanner



        /** Starts this scanner.
          */
        expo.start = function()
        {
            DocumentCachePersistor.addOmnireader( new class extends DocumentReader
            {
                read( cacheEntry, doc ) { scan( doc, cacheEntry.location ); }
            });
        };



       // - P r i v a t e ------------------------------------------------------------------------------


        /** Notes the fact of an unbroken waylink that targets a node of the present document.
          *
          *     @param target (Element) A waylink target node in the present document.
          */
        function noteWaylink( target )
        {
            if( target.interlinkScene ) return; // Already noted

            target.interlinkScene = true;
            const span = asElementNamed( 'span', target.firstChild/*eSTag*/
              .lastChild/*inway*/.lastChild/*hall*/.firstChild/*icon*/.firstChild );
            const iconicText = span.firstChild;
            iconicText.replaceData( 0, iconicText.length, '\u{1f78b}' ); // Unicode 1f78b (round target)
            target.removeAttributeNS( NS_READ, 'isOrphan' );
        }



        /** @param doc (Document) The document to scan, which might be the present document.
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
                if( target !== null) noteWaylink( target );
            }
        }



        return expo;

    }() );



   // ==================================================================================================
   //   I n t e r d o c   W a y l i n k   T r a n s f o r m e r


            class InterdocWaylinkTransformer_Registration
            {

                /** Constructs an InterdocWaylinkTransformer_Registration.
                  *
                  *     @see #sourceNode
                  *     @see #targetID
                  *     @param targDocLoc (string) The location of the other document in normal URL form.
                  */
                constructor( sourceNode, targetID, targDocLoc )
                {
                    this._sourceNode = sourceNode;
                    this._targetID = targetID;
                    this._targetImage = TargetImageCache.read( targDocLoc + '#' + targetID );
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



    /** A device to complete the formation of interdocument bitform waylinks, those whose target nodes
      * are outside of the present document.  It fetches the documents, reads their target nodes
      * and transforms the wayscript accordingly.
      */
    const InterdocWaylinkTransformer = ( function()
    {

        const expo = {}; // The public interface of InterdocWaylinkTransformer



        /** Tells this transformer of a separate way declaration document that the user may reach
          * from the present document by a direct link, which is not a bitform waylink.
          *
          *     @param loc (string) The location of the other document in normal URL form.
          *
          *     @see #registerBitformLink
          *     @see URIs#normalized
          */
        expo.noteTargetDocument = function( loc ) { registerTargetDocument( loc ); };



        /** Registers an unresolved, interdocument bitform waylink and returns the registration.
          *
          *     @param sourceNode (Element) A bitform waylink source node that targets another document.
          *     @param id (string) The identifier of the target within the other document.
          *     @param targDocLoc (string) The location of the other document in normal URL form.
          *
          *     @return (InterdocWaylinkTransformer_Registration)
          *
          *     @see URIs#normalized
          */
        expo.registerBitformLink = function( sourceNode, id, targDocLoc )
        {
            const reg = new InterdocWaylinkTransformer_Registration( sourceNode, id, targDocLoc );
            const regList = registerTargetDocument( targDocLoc );
            regList.push( reg );
            return reg;
        };



        /** Starts this transformer.
          */
        expo.start = function()
        {
            start1_presentDocument( linkRegistry );
            setTimeout( start2_targetDocuments, MS_DELAY_IWT/*browser rest*/, linkRegistry );
            linkRegistry = null; /* Freeing it for eventual garbage collection,
              and blocking henceforth any further attempt to register */
        };



       // - P r i v a t e ------------------------------------------------------------------------------


        /** Map of registered links.  The key to each entry is the location (string) in normal URL form
          * of a targeted way declaration document; the value a registration list (Array of Interdoc-
          * WaylinkTransformer_Registration), one for each bitform, waylink source node of the present
          * document that targets the keyed document, if any.  The keys cover every directly reachable
          * way declaration document as far as possible, regardless of how its source nodes are formed,
          * while the registration lists cover only those source nodes in waylink bitform.
          */
        let linkRegistry = new Map(); // Nulled on *start*



        const MYSTERY_SYMBOL = '?';



        /** @param loc (string) The location of the target document in normal URL form.
          * @return (Array of InterdocWaylinkTransformer_Registration)
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



        /** Ensures that all interdocument bitform waylinks are formed and their target images cached.
          */
        function start1_presentDocument( linkRegistry )
        {
            for( const entry of linkRegistry )
            {
                const linkRegList = entry[1];
                if( linkRegList.length === 0 ) continue; // No bitform links to this target

                const targDocLoc = entry[0];
                DocumentCache.readNowOrLater( targDocLoc, new class extends DocumentReader
                {
                    close( cacheEntry )
                    {
                        if( cacheEntry.document !== null ) return;

                        for( const r of linkRegList ) setTargetPreview( r.sourceNode, MYSTERY_SYMBOL );
                    }

                    read( cacheEntry, targDoc )
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
                                source.setAttributeNS( NS_READ, 'isBroken', 'isBroken' );
                                continue;
                            }

                            LeaderReader.read( target );
                            const leader = LeaderReader.leader;
                            const sN = source.localName;
                            const sNResolved = sN === ELEMENT_NAME_UNCHANGED? target.localName: sN;
                            const sNS = source.namespaceURI;
                            const image = new TargetImage( leader, sNResolved, sNS );
                            if( image.equals( /*imageWas*/linkReg.targetImage ))
                            {
                              // Affirm the source node as is
                              // ----------------------
                                source.removeAttributeNS( NS_READ, 'imaging' );
                                continue;
                            }

                          // Amend the source node, as it shows an outdated image
                          // ---------------------
                            const part2 = new PartTransformC2( source );
                            configureForTarget( sNS, sN, linkV, target, part2 );
                            part2.run();
                            setTargetPreview( source, leader );

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
                DocumentCache.readNowOrLater( srcDocLoc, new class extends DocumentReader
                {
                    read( _cacheEntry/*ignored*/, srcDoc )
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

                            DocumentCache.readNowOrLater( targDocLoc, new class extends DocumentReader
                            {
                                read( _cacheEntry/*ignored*/, targDoc )
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



        return expo;

    }() );



   // ==================================================================================================
   //   I n w a y s


    /** Dealing with inways.  Formally the inway is a component of the start tag (eSTag).
      * Apparently however it lies outside of the tag to the left, where it spans the distance
      * from the page edge to the tag.
      *
      *          ┌·················· eSTag ···················┐
      *                                                       ⋮
      *          ┌————————————— inway ———————————————┐        ⋮
      *                                         hall         tag name
      *          ┌———————— approach ————————┐  ┌—————┐       ╱⋮
      *          ⋮                          ⋮  ⋮     ⋮      ╱ ⋮
      *          ⋮                          ⋮  ⋮  waybit1  ╱  ⋮
      *          ⋮                          ⋮  ⋮     ⋮    ╱   ⋮
      *           ∙ ·  ·   ·    ·     ·         ·     target11
      *          ╱       │                                Content of target11
      *         ╱        │                        waybit2
      *        ╱         │                            Content of waybit2, which is not a target
      *       ╱   ∙ ·  · │ ·    ·             ·   target3
      *   edging         │                            Content of target3
      *                 path
      *
      *
      * On the pointer (↖) crossing any part of the eSTag (including the inway approach),
      * the target icon reveals itself in full:
      *
      *          ┌············································┐
      *          ┌———————————————————————————————————┐        ⋮
      *          ┌——————————————————————————┐  ┌—————┐        ⋮
      *          ⋮                          ⋮  ⋮     ⋮        ⋮
      *          ⋮                          ⋮  ⋮  waybit1     ⋮
      *          ⋮                          ⋮  ⋮     ⋮        ⋮
      *           ∙ ·  ·   ·    ·     ·         ◉     target11
      *                        ↖               ╱          Content of target11
      *                                       ╱   waybit2
      *                                      ╱        Content of waybit2, which is not a target
      *           ∙ ·  ·   ·    ·           ╱ ·   target3
      *                                    ╱          Content of target3
      *                                target
      *                                 icon
      */
    const Inways = ( function()
    {

        const expo = {}; // The public interface of Inways



        /** Ensures the given inway will be laid and shown.
          *
          *     @param inway (HTMLElement)
          *     @param eSTag (Element) The start tag beside which to lay it.
          */
        expo.layWhen = function( inway, eSTag )
        {
            setTimeout( layIf, layWhen_msRest ); // Giving the browser a rest
            layWhen_msRest += 13; // Staggering the overall lay of inways at intervals
            let pollCount = 0;
            function layIf( _msTime/*ignored*/ )
            {
                const tagVpBounds = eSTag.getBoundingClientRect();
                if( tagVpBounds.width ) // Then the tag is laid
                {
                  // Lay the inway and show it
                  // -------------------------
                    lay( inway, tagVpBounds );
                    inway.style.setProperty( 'visibility', 'visible' ); // Overriding readable.css

                  // Ensure it re-lays itself as needed
                  // ------------------------
                    addEventListener( 'resize', (_UIEvent)=>{lay(inway);} );
                }
                else if( pollCount <= 3 )
                {
                    ++pollCount;
                    requestAnimationFrame( layIf ); // Wait for the tag to get laid
                }
                else console.error( "Cannot lay inway, start tag is not being laid" );
            }
        };


            let layWhen_msRest = MS_DELAY_INWAYS; // Delay before 1st lay attempt of next inway



       // - P r i v a t e ------------------------------------------------------------------------------


        /** Lays or re-lays the given inway.
          *
          *     @param inway (Element)
          *     @param tagVpBounds (DOMRectReadOnly) The bounds within the scroller's viewport
          *       of the parent start tag.  If undefined, then this parameter is determined anew.
          */
        function lay( inway, tagVpBounds = inway.parentNode.getBoundingClientRect() )
        {
            let s; // Style

          // Span the left margin from page edge to tag
          // --------------------
            const width = tagVpBounds.left + scrollX;
            s = inway.style;
            s.setProperty( 'left', -width + 'px' );
            s.setProperty( 'width', width + 'px' );

          // Clamp down on the *hall* (child)
          // ------------------------
            const hallVpBounds = inway.lastChild/*hall*/.getBoundingClientRect();
            const height = hallVpBounds.height;
            if( !height/*UZ*/ ) throw 'Inway hall is unlaid';

            s.setProperty( 'height', height + 'px' );

          // Lay the *approach* (child)
          // ------------------
            const approach = inway.firstChild;
            s = approach.style;
            const hallX = width - hallVpBounds.width;
            const availableGap/*approach ↔ hall*/ = hallX - Approaches.minimumWidth();
            if( MIN_GAP - availableGap > GRAPHICAL_ERROR_MARGIN )
            {
                console.error( 'Inway availableGap ' + availableGap + ' < MIN_GAP ' + MIN_GAP );
                s.setProperty( 'display', 'none' );
                return;
            }

            const gap = availableGap > MAX_GAP? MAX_GAP: availableGap;
              // Allowing it to expand up to MAX_GAP, if that much is available
            const lineWidth = hallX - gap;
            s.setProperty( 'width', lineWidth + 'px' ); // [HSP in readable.css]
            s.setProperty( 'height',   height + 'px' );
         // approach.setAttribute( 'width', lineWidth );
         // approach.setAttribute( 'height',   height );
         /// A failed attempt to fix the approach.getBBox failure in Approaches, q.v.
            s.setProperty( 'display', UNSET_STYLE ); // To whatever it was
            Approaches.redraw( approach, lineWidth, height );
        }



        /** The maximum, formal gap between the inway *approach* and the *hall* sibling to its right.
          * The *visual* gap may be wider depending on how the *approach* draws its content.
          */
        const MAX_GAP = 1.5/*rem*/ * REM; // Within which the pointer style defaults, so indicating
                                         // that the two components have distinct control functions.


        /** The minimum, formal gap between the inway *approach* and the *hall* sibling to its right.
          */
        const MIN_GAP_REM = 0.6; // Changing? sync'd → readable.css

        const MIN_GAP = MIN_GAP_REM * REM;



        return expo;

    }() );



   // ==================================================================================================
   //   L e a d e r   R e a d e r


    /** A reader of element leaders.  An element leader is the whitespace collapsed, text content
      * of the element prior to any contained element of wayscript or non-inline layout.
      *
      * To learn merely whether an element has a leader of non-zero length, give a maxLength
      * of zero to the *read* function then inspect *hasLeader* for the answer.
      */
    const LeaderReader = ( function()
    {

        const expo = {}; // The public interface of LeaderReader



        /** The element whose leader was last read, or null if *read* has yet to be called.
          *
          *     @see #read
          */
        expo.element = null;



     // /** The successor of the last child node that contributed to the leader, or null if either
     //   * no child contributed or the last to contribute has no successor.
     //   */
     // expo.endChild = null;



        /** Answers whether the element has a leader of non-zero length.
          */
        expo.hasLeader = false;



        /** Answers whether the leader is truncated.
          */
        expo.isTruncated = false;



        /** The leader as read from the element in the form of a string, possibly truncated.  It will be
          * an empty string if either the element has no leader, or the leader was truncated to nothing.
          */
        expo.leader = '';



        /** Reads the leader of the given element and sets the public properties of this reader to
          * reflect the results of the read.
          *
          *     @param maxLength (number) The length limit on the read.  A read that would exceed this
          *       limit will instead be truncated at the preceding word boundary.
          *     @param toIncludeRead (boolean) Whether to include any text contained within
          *       special markup (NS_READ) elements.
          */
        expo.read = function( element, maxLength=Number.MAX_VALUE, toIncludeRead=false )
        {
            let leader = '';
            let hasLeader = false;
         // let firstContributingChild = null;
         // let lastContributingChild = null;
            expo.isTruncated = false;
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
                if( dType === TEXT_NODE )
                {
                    const words = d.data.match( /\S+/g );
                    if( words === null ) continue dive;

                    hasLeader = true;
                    for( const word of words )
                    {
                        const wN = word.length;
                        if( wN > headroom )
                        {
                            expo.isTruncated = true;
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
                else if( dType === ELEMENT_NODE )
                {
                    const dNS = d.namespaceURI;
                    if( dNS.endsWith(NS_READ) && dNS.length === NS_READ.length ) // Fast failing test
                    {
                        if( !toIncludeRead ) toLastDescendant( dive ); // Bypassing d and its content
                    }
                    else if( dNS.startsWith( NS_WAYSCRIPT_DOT )) break dive;
                    else
                    {
                        const styleDeclarations = getComputedStyle( d );
                        const displayStyle = styleDeclarations.getPropertyValue( 'display' );
                        if( displayStyle === 'inline' ) continue dive;

                        if( styleDeclarations.length === 0 ) // Then something is wrong
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

            expo.element = element;
            expo.leader = leader;
            expo.hasLeader = hasLeader;
         // expo.startChild = firstContributingChild;
         // expo.endChild = lastContributingChild === null? null: lastContributingChild.nextSibling;
        };



     // /** The first child node that contributed to the leader, or null if none did.
     //   */
     // expo.startChild = null;



        return expo;

    }() );



   // ==================================================================================================
   //   L i n k   A t t r i b u t e


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
   //   P a r t   T r a n s f o r m   C


    /** The part of the transformation of a wayscript element that is generally open to being redone.
      * This is a disposable, single-use class.
      */
    class PartTransformC
    {


        /** Constructs a PartTransformC.
          *
          *     @see #element
          */
        constructor( element )
        {

           // - i n p u t - / - c o n f i g u r a t i o n - - - - - - - - - - - - - - - - - - - - - - -

            /** The wayscript element to transform.
              */
            this.element = element;


            /** A non-null value indicates a tranformation that might actually be redone.
              * Meantime the form is either based on a cached image of a waylink target node
              * (value ‘present’) or not (‘absent’).
              */
            this.imaging = null;


            /** The altered string to show for the local part of the element's qualified name,
              * or null to leave it unaltered.
              */
            this.localPartOverride = null;


           // - o u t p u t - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            /** The inserted start tag element, or null if *run* was not called.
              */
            this.eSTag = null;

        }



        /** Does the partial transformation of the element.  Specifically this method:
          * (a) reads this transform's input/configuration properties and sets its output properties;
          * (b) reads the element's leader and leaves the results in the LeaderReader; and
          * (c) sets attributes on the element and inserts an *eSTag* child to form its start tag.
          * Call once only.
          */
        run()
        {
            const e = this.element;
            const imaging = this.imaging;
  /*[C2]*/  if( imaging !== null ) e.setAttributeNS( NS_READ, 'imaging', imaging );

          // Leader
          // ------
            const toIncludeRead = true;
              // Else the leader would exclude *forelinker* content in the case of a waylink source node
            console.assert( e.firstChild === null || e.firstChild.nodeName !== 'eSTag', A );
              // Else the leader would include the start tag
            LeaderReader.read( e, /*maxLength*/0, toIncludeRead );
  /*[C2]*/  if( LeaderReader.hasLeader ) e.setAttributeNS( NS_READ, 'hasLeader', 'hasLeader' );

          // Start tag
          // ---------
            console.assert( this.eSTag === null, AA + 'Method *run* is called once only' );
            const eSTag = this.eSTag = document.createElementNS( NS_READ, 'eSTag' );
  /*[C2]*/  e.insertBefore( eSTag, e.firstChild );
            const eQName = eSTag.appendChild( document.createElementNS( NS_READ, 'eQName' ));

          // prefix part of name
          // - - - - - - - - - -
            const prefix = e.prefix;
            let isPrefixAnonymousOrAbsent;
            if( prefix !== null )
            {
                const ePrefix = eQName.appendChild( document.createElementNS( NS_READ, 'ePrefix' ));
                ePrefix.appendChild( document.createTextNode( prefix ));
                if( prefix === ELEMENT_NAME_NONE )
                {
                    isPrefixAnonymousOrAbsent = true;
                    ePrefix.setAttributeNS( NS_READ, 'isAnonymous', 'isAnonymous' );
                }
                else isPrefixAnonymousOrAbsent = false;
            }
            else isPrefixAnonymousOrAbsent = true;

          // local part of name
          // - - - - - - - - - -
            const eName = eQName.appendChild( document.createElementNS( NS_READ, 'eName' ));
            let isAnonymous = false;
            let lp = this.localPartOverride;
            localPart:
            {
                if( lp === null )
                {
                    lp = e.localName;
                    if( lp === ELEMENT_NAME_NONE )
                    {
                        isAnonymous = true;
                        lp = '●'; // Unicode 25cf (black circle)
                        eQName.setAttributeNS( NS_READ, 'isAnonymous', 'isAnonymous' );
                    }
                    else if( lp.charAt(0) !== '_' ) lp = lp.replace( /_/g, NO_BREAK_SPACE );
                      // Starts with a non-underscore, hopefully followed by some other visible content?
                      // Then replace any underscores with nonbreaking spaces for sake of readability.
                }
                else if( lp.length === 0 ) break localPart;

                eName.appendChild( document.createTextNode( lp ));
            }

          // formation of name
          // - - - - - - - - -
            const eNS = e.namespaceURI;
            let formedName, maxShort;
            if( eNS === NS_STEP )
            {
                formedName = isAnonymous && !isPrefixAnonymousOrAbsent? prefix: lp;
                maxShort = 1; // Less to allow room for extra padding that readable.css adds
            }
            else
            {
                formedName = lp;
                maxShort = 2;
            }
  /*[C2]*/  if( formedName.length <= maxShort )
            {
                e.setAttributeNS( NS_READ, 'hasShortName', 'hasShortName' );
            }
        }


    }



   // ==================================================================================================
   //   P a r t   T r a n s f o r m   C 2


    /** PartTransformC for an element whose initial transformation needs to be redone.
      */
    class PartTransformC2 extends PartTransformC
    {

        /** Constructs a PartTransformC2, first removing the markup of the previous transform.
          *
          *     @see PartTransformC#element
          */
        constructor( element )
        {
            super( element );
            const eSTag = asElementNamed( 'eSTag', element.firstChild );
            if( eSTag === null ) throw 'Missing eSTag';

            element.removeChild( eSTag );

            // Remove any attributes that might have been set:
            element.removeAttributeNS( NS_READ, 'hasLeader' );
            element.removeAttributeNS( NS_READ, 'hasShortName' );
            element.removeAttributeNS( NS_READ, 'imaging' );
        }

    }




   // ==================================================================================================
   //   T a r g e t   C o n t r o l


    /** Self activation and scene switching for waylink target nodes.
      */
    const TargetControl = ( function()
    {

        const expo = {}; // The public interface of TargetControl



        /** Adds controls for a target node.
          *
          *     @param eSTag (Element) The start tag of the target node.
          */
        expo.addControls = function( eSTag ) { eSTag.addEventListener( 'click', hearClick ); };



       // - P r i v a t e ------------------------------------------------------------------------------


        /** @param click (MouseEvent) A click event from within the start tag.
          */
        function hearClick/* event handler */( click )
        {
            const eSTag = click.currentTarget; // Where listening
            const eClicked = click.target;    // What got clicked

          // =====================
          // Empty container space clicked?  No function
          // =====================
            if( eClicked === eSTag ) return; // Start tag element itself, as opposed to a descendant

            const eClickedNS = eClicked.namespaceURI;
            if( eClicked.parentNode === eSTag && eClicked.localName === 'div'
             && eClickedNS === NS_HTML ) return; // Inway element itself, as opposed to a descendant

          // ================
          // Inway *approach* clicked?  Function is scene switching
          // ================
            const targetNode = eSTag.parentNode; // *Waylink* target node
            const elementOnTarget = Hyperlinkage.elementOnTarget();
            if( eClickedNS === NS_SVG ) // inway approach
            {
                if( targetNode !== elementOnTarget ) return; // Switch is disabled

                const u = new URL( location.toString() ); // [WDL]
                u.hash = ''; // Remove the fragment
                const pp = u.searchParams;
                pp.set( 'sc', 'inter' );
                pp.set( 'link', targetNode.getAttribute('id') );
             // history.replaceState( history./*duplicate of*/state, /*no title*/'', u.href ); // TEST
                return;
            }

          // ==============================
          // Inway *hall* or start tag name clicked:  Function is self activation
          // ==============================
            const view = document.scrollingElement; // Within the viewport
            const scrollTopWas = view.scrollTop;
            const scrollLeftWas = view.scrollLeft;

          // Drop a breadcrumb before changing location
          // -----------------
            Breadcrumbs.dropCrumb( targetNode );

          // Toggle the browser location, on target ⇄ off target
          // ---------------------------
            if( targetNode === elementOnTarget ) // Δ: on target → off target
            {
                location.hash = ''; // Moving off target, no URI fragment in address bar
                const loc = location.toString(); // [WDL]
                if( loc.endsWith( '#' )) // Then it left the fragment delimiter hanging there, visible,
                {                 // like the grin of the Cheshire Cat (Firefox, Chrome).  Remove it:
                    history.replaceState( history./*duplicate of*/state, /*no title*/'',
                      loc.slice(0,-1) );
                }
            }
            else location.hash = targetNode.getAttribute( 'id' ); // Δ: off target → on target

          // Stabilize the view within the viewport
          // ------------------
            view.scrollTop = scrollTopWas;
            view.scrollLeft = scrollLeftWas;
        }



        return expo;

    }() );



   // ==================================================================================================
   //   T a r g e t   I m a g e


    /** The image of a waylink target node as mirrored by its source nodes.
      */
    class TargetImage
    {


        /** Constructs a TargetImage.
          *
          *     @see #leader
          *     @see #localName
          *     @see #namespaceURI
          */
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
            if( other === null ) return false;

            return this._leader === other.leader
              && this._localName === other.localName
              && this._namespaceURI === other.namespaceURI;
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
   //   T a r g e t   I m a g e   C a c h e


    const TargetImageCache = ( function() // [TIC]
    {

        const expo = {}; // The public interface of TargetImageCache



        /** Retrieves the image of the indicated target.
          *
          *     @param targetLoc (string) The target location in normal URL form.
          *     @return (TargetImage) The cached image, or null if none is cached.
          *
          *     @see URIs#normalized
          */
        expo.read = function( targetLoc )
        {
            const s = sessionStorage.getItem( SS_KEY_PREFIX + targetLoc );
            if( s !== null )
            {
                const o = JSON.parse( s ); // Yields object form (o) of original image stored
                try { return new TargetImage( o._leader, o._localName, o._namespaceURI ); }

                catch( x )
                {
                    if( isUserNonProgrammer || x !== MALFORMED_PARAMETER ) throw x;

                    console.warn( 'Suppressing an exception expected only while programming: ' + x );
                }
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
        expo.write = function( targetLoc, image )
        {
            if( URIs.isDetectedAbnormal( targetLoc )) throw URIs.message_abnormal( targetLoc );

            if( image === null ) throw NULL_PARAMETER;

            sessionStorage.setItem( SS_KEY_PREFIX + targetLoc,
              JSON.stringify( image, /*replacer*/null, SESSION_STRINGIFY_SPACING ));
        };



       // - P r i v a t e ------------------------------------------------------------------------------


        /** Common prefix of any session storage key (string)
          * for a cached target image (JSON stringified TargetImage).
          */
        const SS_KEY_PREFIX = NS_READ + '.TargetImageCache.';



        return expo;

    }() );



   // ==================================================================================================
   //   T a r g e t   W h e r e a b o u t s


        const TARGET_UP   = 'up';
        const TARGET_DOWN = 'down';



    /** The approximate location of a hyperlink target node relative to its source node.
      */
    class TargetWhereabouts
    {


        /** Constructs a TargetWhereabouts.
          *
          *     @see #direction
          *     @see #documentLocationN
          *     @see #target
          */
        constructor( direction, documentLocationN, target )
        {
            this._direction = direction;
            this._documentLocationN = documentLocationN;
            this._target = target;
        }



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




        /** Constructs a TargetWhereabouts from a waylink source node.
          *
          *     @param source (Element) The waylink source node.
          *     @param link (LinkAttribute) The parsed *link* attribute of the source node.
          */
        static fromSource( source, link )
        {
            const docLoc = link.targetDocumentLocation;
            if( docLoc.length > 0 )
            {
                const docLocN = URIs.normalized( docLoc );
                if( docLocN !== DOCUMENT_LOCATION ) // Then the target is outside the present document
                {
                    return new TargetWhereabouts( /*direction*/null, URIs.normalized(docLoc),
                      /*target*/null );
                }
            }

            // The target is nominally within the present document
            const target = document.getElementById( link.targetID );
            if( target !== null )
            {
                return fromLink( source, target );

                /** Constructs a TargetWhereabouts from a source and target node,
                  * both located in the present document.
                  *
                  *     @param source (Element) The source node.
                  *     @param target (Element) The target node.
                  */
                function fromLink( source, target )
                {
                    const direction = ( ()=>
                    {
                        const targetPosition = source.compareDocumentPosition( target );
                        if( targetPosition & DOCUMENT_POSITION_PRECEDING ) return TARGET_UP;

                        console.assert( targetPosition & DOCUMENT_POSITION_FOLLOWING, A );
                        return TARGET_DOWN;
                    })();
                    return new TargetWhereabouts( direction, /*documentLocationN*/'', target );
                }
            }

            tsk( 'Broken waylink: No such *id* in this document: ' + a2s('link',link.value) );
            return new TargetWhereabouts( /*direction*/null, /*documentLocationN*/'', target );
        }



        /** The target node within the present document, or null if there is none.
          * This property is null in the case of an interdocument or broken hyperlink.
          */
        get target() { return this._target; }


    }



   // ==================================================================================================
   //   V i e w p o r t i n g


    /** Dealing with the viewport and its scroller.
      */
    const Viewporting = ( function()
    {

        const expo = {}; // The public interface of Viewporting



        /** Ensures that the actively hyperlink-targeted element, if any,
          * will be visible within the viewport.
          *
          *     @see Hyperlinkage#elementOnTarget
          */
        expo.ensureTargetWillShow = function() // [HTP]
        {
            const e = Hyperlinkage.elementOnTarget();
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

         // console.debug( 'Viewporting.ensureTargetWillShow: Repositioning' ); // TEST
            e.scrollIntoView( targetPositioningOptions );
        };



       // - P r i v a t e ------------------------------------------------------------------------------


        const targetPositioningOptions = { behavior:'instant', block:'start', inline:'nearest' }



        return expo;

    }() );



   // ==================================================================================================
   //   W a y t r a c e r


    /** A device for tracing the way across multiple waylinked documents.  It traces the root element's
      * waylinks to their target nodes, thence onward till it traces the full network of waylinks.
      * The trace serves two purposes: (1) to discover documents for cache omnireaders; and
      * (2) to adjust the form of the present document based on the results.
      *
      *     @see http://reluk.ca/project/wayic/cast/root#root_element
      *     @see DocumentCache#addOmnireader
      */
    const WayTracer = ( function()
    {

        const expo = {}; // The public interface of WayTracer



        /** Starts this tracer.
          */
        expo.start = function()
        {
         // console.debug( 'Trace run starting' ); // TEST
            const id = ROOT_LEG_ID;
            console.assert( !(toEnforceConstraints && wasOpened(id)), A );
            openLeg( id );
            DocumentCache.readNowOrLater( ROOT_DOCUMENT_LOCATION, new class extends DocumentReader
            {
                close( cacheEntry ) { shutLeg( id ); }
                read( cacheEntry, doc )
                {
                    const target = doc.getElementById( 'root', doc );
                    if( target !== null ) traceLeg( id, target, cacheEntry );
                    else tsk( 'Unable to trace: Missing root waybit: ' + id );
                }
            });
        };



       // - P r i v a t e ------------------------------------------------------------------------------


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
          *     @param cacheEntry (DocumentCacheEntry)
          */
        function traceLeg( legID, branch, cacheEntry )
        {
            const docLoc = cacheEntry.location;
            const doc = branch.ownerDocument;
            if( doc === document )
            {
                branch.setAttributeNS( NS_READ, 'isOnWayBranch', 'isOnWayBranch' );
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
                    // Rather take it as the wayscribe intended, so extend the trace.
                    let tDocLoc = link.targetDocumentLocation;
                    tDocLoc = tDocLoc.length > 0? URIs.normalized(tDocLoc): docLoc;
                    const targetID = link.targetID;
                    const targetLegID = newLegID( tDocLoc, targetID );
                    if( wasOpened( targetLegID )) break source;

                    openLeg( targetLegID );
                    DocumentCache.readNowOrLater( tDocLoc, new class extends DocumentReader
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



        return expo;

    }() );



   // ==============

    return expo;

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
  *  [BA] · Boolean attribute.  A boolean attribute such as [read:isFoo] either has the same value
  *         as the local part of its name (‘isFoo’), which makes it true, or it is absent
  *         and thereby false.  cf. http://w3c.github.io/html/infrastructure.html#sec-boolean-attributes
  *
  *  [C2] · The constructor of PartTransformC2 must remove all such markup.
  *
  *  [FHS]  Firefox (52.2) has the wrong History.state after travelling over entries E → E+2 → E+1,
  *         at least if E and E+1 differ only in fragment: it has state E, but should have E+1.
  *
  *  [FIB]  Focus for inline breadcrumbs.  Here avoiding use of the HTML focus facility as a base
  *         for inline breadcrumb trails.  It seems unreliable.  The browsers are doing their own
  *         peculiar things with focus which are hard to work around.
  *         http://w3c.github.io/html/editing.html#focus
  *
  *  [FSS]  Session storage for a document requested from a ‘file’ scheme URL.  On moving from document
  *         D1 to new document D2 by typing in the address bar (not activating a link), an item stored
  *         by D2 may, after travelling back, be unreadable by D1, as though it had not been stored.
  *         Affects Firefox 52.6.  Does not affect Chrome under option ‘--allow-file-access-from-files’.
  *
  *  [HTP]  Hyperlink target positioning.  Normally the browser itself does this, vertically scrolling
  *         the view to ensure the target appears in the viewport.  Firefox 60 was seen to fail however.
  *         It failed when this program was loaded by a *script* element injected at runtime.
  *         Probably because then the program was late in running and late in styling the elements
  *         - especially in giving the crucial display style of ‘block’ to the specialized elements,
  *         which are XML, therefore ‘inline’ by default - this confused the browser.
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
  *  [ODO]  Out of display order.  This sometime present element is declared out of
  *         display order so not to interfere with the ordering of its ever present siblings.
  *         Normally it would be declared earlier, but that would complicate the lookup of its siblings,
  *         making them harder to find.
  *
  *  [OUR]  Here the entry reference is restricted to *our* entries in the session history.
  *         An entry's document might not run this program, or its session store might be inaccessible
  *         to this program.  Such an entry would not be *ours* in the present sense of the term.
  *
  *  [PD] · Path data.  It could instead be defined using the new SVGPathData interface, but this
  *         (array-form instead of string-form definition) wouldn’t help enough to outweigh the bother
  *         of using a polyfill.  https://github.com/jarek-foksa/path-data-polyfill.js
  *
  *  [PSA]  Page-show animation.  On revisiting a loaded page in session history (forward or backward),
  *         sometimes Firefox (60) fails to start or restart an animation commanded by a style rule.
  *
  *  [RPP]  Restricted public property.  Despite its exposure in the public interface,
  *         this property is not intended for general use.
  *
  *  [SH] · Standard HTML.  Here avoiding special markup in favour of standard HTML,
  *         thus gaining access to HTML-particular features such as the *style* attribute.
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
  *  [UN] · Either *undefined* or null in value.
  *
  *  [UZ] · Either *undefined* or zero in value.
  *
  *  [WDL]  ‘window.location’ or ‘document.location’?  One may use either, they are identical.
  *         https://www.w3.org/TR/html5/browsers.html#the-location-interface
  *
  *  [XN] · XML names.  https://www.w3.org/TR/xml-names/
  */


// Copyright © 2017-2018 Michael Allan and contributors.  Licence MIT.
