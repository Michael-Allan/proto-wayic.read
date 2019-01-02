/** readable.js - Document programming on the client side
  *
  *   Summoned by the waycaster’s personal configuration program (see manual.task § Installation),
  *   this presentation program runs on the client side — in the waycast reader’s Web browser —
  *   where it manipulates the DOM of each way declaration document.
  *
  *   See manual.task for usage instructions.  The sections below are for programmers.
  *
  *
  * EXTENSION of HTML DOM
  * ---------------------
  *   This program adds one property to the Element interface, for internal purposes only.
  *
  *   Element
  *   -------
  *       surjointScene · (boolean) Set on a subjoining waybit, answers whether this subjoining waybit
  *                       has a surjoint scene.  But this is only temporary; later this property will
  *           instead point to the *scene* element that encodes the subjoining waybit’s surjoint scene.
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
  * MARKUP INSERTIONS
  * -----------------
  *   This program introduces its own markup to the document as outlined in the subsections below.
  *   Most of the introduced markup is namespaced ‘data:,wayic.read’.
  *
  *   Key to the outlines below:
  *
  *       *          ∙ Any element in any XML namespace
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
  *     [lighting]      · Either ‘paper’ for black on white effects, or ‘neon’ for the reverse
  *     [travelDelta]    · Travel distance in session history to reach the present entry
  *                        from the last entry of ours that was shown: -N, 0 or N
  *                        (backward by N entries, reload, or forward by N entries). [OUR]
  *     [targetDirection] · (only if an element is window targeted) Direction to the targeted element
  *                         (target) from its hyperlink trigger.
  *         Value  Meaning
  *         ·····  ············································································
  *         self   Target and trigger are identical
  *         up     Target is above the trigger in document order
  *         down   Target is below the trigger
  *         in     Intradocument travel by extradocument trigger (e.g. bookmark or address bar)
  *         out    Extradocument travel (i.e. interdocument or from a non-document location)
  *
  *
  *   html:body
  *   ---------
  *     scene      ∙ Document scene
  *         [:id]   · ‘wayic.read.document_scene’
  *     scene        ∙ Surjoint scene(s), if any.  There may be any number of these.
  *         [:class] · ‘surjoint’
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
  *   * (as a) proper Wayscript element
  *   --------------------------
  *     [hasLeader]         · Has leading, non-whitespace text?  [BA]
  *     [isProperWayscript] · Is an element of Wayscript proper?
  *     [isWaybit]          · Is a waybit?
  *     [presentsShortName] · Is a non-step presenting an *eQName* no longer than two characters,
  *                           or a step no longer than one?  The value is one of ‘0’, ‘01’ or ‘012’,
  *                           according to the presented length.
  *
  *     eSTag       ∙ Start tag of an element, to make it visible in the way model
  *         eQName              ∙ Qualified name of the element [QN]
  *             [isAnonymous]    · Has a local part that is declared to be anonymous?  [BA]
  *             ePrefix           ∙ XML namespace prefix, if any
  *                 [isAnonymous] · Has a prefix that is declared to be anonymous?
  *             eName             ∙ Local part of the name
  *                 [:class]     · One of none or ‘wideCharacterSpace’
  *
  *     textAligner ∙ (only if element is a step)
  *
  *
  *   html:a, hyperlink trigger
  *   ------
  *     [showsBreadcrumb] · Holds and prominently shows the breadcrumb for this entry of the session
  *                         history?  Set after travelling back in history onto this element,
  *                         it reorients the user by highlighting his original point of departure.
  *                         Appears at most on one element. [BA, readable.css FIB]
  *     [targetDirection] · Direction to the target: one of ‘self’, ‘up’ or ‘down’ (see § html:html).
  *                         Present only for a complete (target exists) intradocument hyperlink.
  *
  *
  *   hyperstyler, presenter of a generic hyperlink trigger or referential jointer (both use it)
  *   -----------
  *     html:a         ∙ (§ q.v.)
  *         [way:join] · (only if element *a* is a referential jointer) [S]
  *     triggerMark    ∙ Hyperlink trigger indicator.  It contains ‘*’.
  *
  *
  *   * (as a) Bitform referential jointer
  *   ------------------------------------
  *     [hasPreviewString] · Has a non-empty subjoint preview string?  [BA]
  *     [imaging]          · Indicates a form that might yet change.  Meantime it is either based on a
  *                          cached image of the subjoining waybit (value ‘present’) or not (‘absent’).
  *     [isBroken] · Forms a broken joint, referring to a subjoining waybit that is either non-existent
  *                  (yielding an incomplete joint) or itself a jointer (yielding a double joint)?  [BA]
  *     [way:join] ·  [S]
  *
  *     eSTag                  ∙ (q.v. under § proper Wayscript element)
  *     textAligner             ∙ (only if element is a step)
  *     bitformJointing          ∙ Jointing presenter
  *         html:a                ∙ (§ q.v.)
  *             [targetDirection] · (q.v. under § html:a)
  *             preview           ∙ Subjoint preview
  *             html:br           ∙
  *             verticalTruncator ∙ Indicator of the hyperlink trigger, and of the partialness
  *                                 of the subjoint preview.
  *                 html:span     ∙ Containing the visible indicator, exclusive of padding
  *
  *
  *   * (as a) Subjoining waybit
  *   ----------------------------
  *     [isSubjoining]   · Either ‘window targeted’ or ‘window untargeted’ [FT in readable.css]
  *     [:id]             ·
  *     [showsBreadcrumb] · (q.v. under § html:a)
  *
  *     eSTag               ∙ (q.v. under § proper Wayscript element)
  *         html:div         ∙ Inway  [SH, ODO]
  *             [:class]      · ‘inway’
  *             svg:svg        ∙ Approach
  *                 [:class]    · ‘approach’
  *                 svg:circle   ∙ Edging
  *                     [:class] · ‘edging’
  *                 svg:path     ∙ Path
  *             hall             ∙
  *                 icon          ∙ Subjoining waybit icon
  *                     html:span ∙ Holder of main iconic content
  *                     bullseye  ∙ Iconic bullseye, a dimensionless point centred on the icon
  *
  *
  * NOTES  (see at bottom)
  * -----
  */
'use strict';
console.assert( (eval('var _tmp = null'), typeof _tmp === 'undefined'),
  'Failed assertion: Strict mode is in effect' );
  // http://www.ecma-international.org/ecma-262/6.0/#sec-strict-mode-code
  // Credit Noseratio, https://stackoverflow.com/a/18916788/2402790
window.wayic_read_readable = ( function()
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

      // Document shown, view stable in the typical case [SIC]
      // --------------
        ensureDocumentWillShow();
        if( LOAD_BREAKS_GROUND ) Viewporting.ensureTargetWillShow();

      // Processes launched, view may deflect in atypical cases
      // ------------------
        DocumentCachePersistor.start();
        AlldocScanner.start();
        SurjointFinisher.start();
        WayTracer.start();
    };



  /// ==================================================================================================
 ///  P r e l i m i n a r y   d e c l a r a t i o n s
/// ====================================================================================================


    /** Whether the present document was requested from a 'file' scheme URI.
      */
    const wasRequestFileSchemed = document.URL.startsWith( 'file:' );



    /** Whether the user can likely edit the present document.
      */
    const isUserEditor = wasRequestFileSchemed;



    /** A copy of the statelet root for the present load of the document as captured at load time,
      * just prior to any initialization or modification of it.  Its value may be null.
      */
    const loadTimeHistoryState = history./*copy of*/state;



    /** Identifier of the XML namespace of HTML.
      */
    const NS_HTML = 'http://www.w3.org/1999/xhtml';



    /** Identifier of the XML namespace of wayic.read markup.
      */
    const NS_READ = 'data:,wayic.read';



    /** Identifier of the top para-namespace of Wayscript proper.
      *
      *     @see #TOP_ID_BIT
      *     @see #TOP_ID_STEP
      *
      *     @see § Namespacing § hierarchy [S]
      */
    const PARA_NS_WAY = 'data:,wayscript.';



    const SHOW_ELEMENT = NodeFilter.SHOW_ELEMENT;



    /** The top sub-identifier of a waybit proper.
      *
      *     @see #NS_BIT
      *     @see § Namespacing § top sub-identifier [S]
      */
    const TOP_ID_BIT = 'bit';



    /** The top sub-identifier of a step.
      *
      *     @see #NS_STEP
      *     @see § Namespacing § top sub-identifier [S]
      */
    const TOP_ID_STEP = 'bit.step';



   // ==================================================================================================
   //   U R I s


    /** Dealing with Uniform Resource Identifiers.
      *
      *     @see https://tools.ietf.org/html/rfc3986
      */
    const URIs = ( function()
    {

        const expo = {}; // The public interface of URIs

        // Changing?  sync'd → http://reluk.ca/project/wayic/lex/_/reader.js



        /** Returns the absolute form of the given URI reference; without a fragment, that is.
          *
          *     @param ref (string)
          *
          *     @see Absolute URI, https://tools.ietf.org/html/rfc3986#section-4.3
          *     @see #defragmented
          */
        expo.absolute = function( ref )
        {
            const c = ref.lastIndexOf( '#' );
            if( c >= 0 ) ref = ref.slice( 0, c ); // Defragmented
            return ref;
        };



        /** Returns the same basic URI reference, but without a fragment.
          * This function is a convenience, a descriptive alias of *absolute*.
          *
          *     @param ref (string)
          */
        expo.defragmented = function( ref ) { return expo.absolute( ref ); }



        /** The pattern of a URI reference that contains a dot segment.
          *
          *     @see dot-segment, https://tools.ietf.org/html/rfc3986#section-3.3
          */
        expo.DOT_SEGMENTED_PATTERN = new RegExp( '^(?:[^?#]*/)?\\.\\.?(?:/|$)' );
          //                                       -- PS -- / -- DS --
          // PS = Preceding segments.  Necessarily they contain no query (?) or fragment (#) delimiter,
          //      because that would terminate the path.
          // DS = Dot segment.



        /** Answers whether the given URI reference is detected to have an abnormal form,
          * with any detection depending also on whether *toEnforceConstraints*.
          *
          *     @param ref (string)
          *     @return (boolean)
          *
          *     @see #normalized
          */
        expo.isDetectedAbnormal = function( ref )
        {
            if( toEnforceConstraints )
            {
                try{ return ref !== expo.normalized(ref) }
                catch( x ) { console.warn( 'Suppressed exception: ' + x ); } // E.g. if *ref* relative
            }
            return false;
        };



        /** Answers whether the given URI reference is a relative reference with an absolute path.
          *
          *     @param ref (string)
          *
          *     @see Relative reference, https://tools.ietf.org/html/rfc3986#section-4.2
          *     @see path-absolute,      https://tools.ietf.org/html/rfc3986#section-3.3
          */
        expo.isRelative_pathAbsolute = function( ref )
        {
            const n = ref.length;
            return n > 0 && ref.charAt(0) === '/'
              && /*not a network-path reference*/(n === 1 || ref.charAt(1) !== '/') // [NPR]
        };



        /** Returns a message (string) that the given URI reference is not in normal form.
          *
          *     @param ref (string)
          *     @see #normalized
          */
        expo.makeMessage_abnormal = function( ref ) { return 'Not in normal form: ' + ref; };



        /** Returns the normal form of the given URI reference,
          * which is generally adequate to compare references for equivalence.
          *
          * This is a convenience function.  If you already have an instance of URL,
          * then a direct call to *normalizedU* will be simpler and more efficient.
          *
          *     @param ref (string) A URI reference.
          *       See: URI-reference, https://tools.ietf.org/html/rfc3986#section-4.1
          *     @param base (string, optional unless *ref* is relative) The base URI.
          *       See: Establishing a base URI, https://tools.ietf.org/html/rfc3986#section-5.1
          *
          *     @throw Error if *ref* is relative and *base* is undefined.
          *
          *     @return (string)
          *     @see Normalization and comparison, https://tools.ietf.org/html/rfc3986#section-6
          */
        expo.normalized = function( ref, base )
        {
            return expo.normalizedU( new URL( ref, base )); // [UAU]
        };



        /** Returns the normal form of the given URI reference,
          * which is generally adequate to compare references for equivalence.
          *
          *     @param refU (URL) An instance of *URL* from the URL API. [UAU]
          *       https://url.spec.whatwg.org/
          *
          *     @return (string)
          *     @see Normalization and comparison, https://tools.ietf.org/html/rfc3986#section-6
          */
        expo.normalizedU = function( refU ) { return refU.href; };
          // URL.href is the same "serialization" by which the URL API determines equivalence.
          // https://url.spec.whatwg.org/#dom-url-href
          // https://url.spec.whatwg.org/#url-equivalence



        /** The pattern of a schemed URI reference, one that includes a scheme component,
          * which would make it a URI as opposed to a relative reference.
          *
          *     @see URI reference,      https://tools.ietf.org/html/rfc3986#section-4.1
          *     @see URI,                https://tools.ietf.org/html/rfc3986#section-3
          *     @see Relative reference, https://tools.ietf.org/html/rfc3986#section-4.2
          */
        expo.SCHEMED_PATTERN = new RegExp( '^[A-Za-z0-9][A-Za-z0-9+.-]*:' );



        return expo;

    }() );



  /// ==================================================================================================
 ///  S i m p l e   d e c l a r a t i o n s   i n   l e x i c a l   o r d e r
/// ====================================================================================================



    /** The default message for console assertions.
      */
    const A = 'Failed assertion';



    /** Transforms the given attribute declaration to a string.
      *
      *     @param name (string) The formal name of the attribute.
      *     @param value (string) The actual value of the attribute.
      *
      *     @see #qp2s
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



    /** The pattern of string that begins with characters that would look out of place immediately
      * following an asterisk or like superscript.  Captures in group (1) the offending characters.
      */
    const ASTERISK_OFFENDING_PATTERN = new RegExp( '^([,;:…]|[.!?]+)\\s' );



    const BREAK_SYMBOL = '\u{1f5d9}';
      // Unicode 1f5d9 (cancellation X).  Changing? sync'd → readable.css.



    /** The location of the waycast root directory (string) as a non-empty relative-path reference,
      * but without a trailing slash '/'.  Appending a slash will yield a valid reference.
      *
      *     @see relative-path reference, https://tools.ietf.org/html/rfc3986#section-4.2, -3.3
      */
    const CAST_ROOT_PATH = ( ()=>
    {
        // Determining the value from the *script* element that loads the waycaster's
        // personal configuration program.
        const configFileName = 'way_declaration_document.js';
        const traversal = document.createTreeWalker( document.body, SHOW_ELEMENT );
        for( let t = traversal.lastChild(); t !== null; t = traversal.previousSibling() )
        {
            if( t.localName === 'script' && t.namespaceURI === NS_HTML )
            {
                let ref = t.getAttribute( 'src' );
                if( ref && ref.endsWith(configFileName) )
                {
                    let rN = ref.length - configFileName.length;
                    if( rN === 0 ) return '.'; // Typical case

                    form:
                    {
                        if( ref.charAt(0) === '/' ) break form;
                          // Either an absolute path or network-path reference [NPR]

                        const rColon = ref.indexOf( ':' );
                        if( rColon >= 0 )
                        {
                            const rSlash = ref.indexOf( '/' );
                            console.assert( rSlash >= 0, A ); // Given the above, there must be one
                            if( rColon < rSlash ) break form; /* In a relative-path reference,
                              the 'first path segment cannot contain a colon (":") character'.
                              https://tools.ietf.org/html/rfc3986#section-4.2, -3.3 */
                        }

                        while( ref.charAt(--rN) === '/' ) ref = ref.slice( 0, rN ); /* Removing
                          the final segment and its preceding slash or slashes (weird edge case). */
                        return ref;
                    }

                    throw 'Not a relative-path reference (' + a2s('src',ref) + ')';
                }
            }
        }

        tsk( 'Missing ' + configFileName + ' *script* element in document *body*' );
        return '__UNDEFINED_waycast_root_directory__';
    })();



    /** The location of the waycast root directory (string) in normal URI form,
      * and with a trailing slash '/'.
      *
      *     @see URIs#normalized
      */
    const CAST_ROOT_URI = ( ()=>
    {
        let uri = URIs.normalized( CAST_ROOT_PATH, /*base*/location.toString() );
        if( !uri.endsWith('/') ) uri = uri + '/';
        return uri;
    })();



    const COMMENT_NODE = Node.COMMENT_NODE;



    /** Configures a bitform referential jointer for a given, actual subjoining waybit.
      *
      *     @param jtrNS (string) The XML namespace of the jointer.
      *     @param jtrN (string) The local part of the jointer's name.
      *     @param joinV (string) The value of the jointer's *join* attribute.
      *     @param sbj (Element | SubjointImage) The subjoining waybit, or its cached image.
      *     @param transform (PartTransformC)
      */
    function configureForSubjoint( jtrNS, jtrN, joinV, sbj, transform )
    {
        const sbjNS = sbj.namespaceURI;
        const sbjN = sbj.localName;
        if( jtrNS !== sbjNS )
        {
            tsk( 'Jointer namespace (' + jtrNS + ') differs from subjoining waybit namespace ('
              + sbjNS + ') for referential jointer ' + a2s('join',joinV) );
        }
        if( jtrN === ELEMENT_NAME_UNCHANGED ) transform.localPartOverride = sbjN;
          // Transforming to the same name as the subjoining waybit
    }



    /** Configures a bitform referential jointer for a given subjoint *preview* element.
      *
      *     @param jointer (Element) The jointer.
      *     @param preview (Element) Its *preview* element.
      */
    function configureForSubjointPreview( jointer, preview, previewString )
    {
        const pointCount = countCodePoints( previewString );
        if( pointCount === 0 )
        {
            jointer.removeAttributeNS( NS_READ, 'hasPreviewString' );
            preview.classList.remove( 'singleCharacterContent' ); // If present
        }
        else
        {
            jointer.setAttributeNS( NS_READ, 'hasPreviewString', 'hasPreviewString' );
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



    const DOCUMENT_NODE = Node.DOCUMENT_NODE;



    const DOCUMENT_POSITION_FOLLOWING = Node.DOCUMENT_POSITION_FOLLOWING;
    const DOCUMENT_POSITION_PRECEDING = Node.DOCUMENT_POSITION_PRECEDING;



    const DOCUMENT_SCENE_ID = NS_READ + '.document_scene';



    /** The location of present document (string) in normal URI form.
      *
      *     @see URIs#normalized
      */
    const DOCUMENT_URI = ( ()=>
    {
        // Changing?  sync'd → http://reluk.ca/project/wayic/lex/_/reader.js
        const ref = URIs.defragmented( location.toString() ); // [WDL]
        return URIs.normalized( ref ); // To be certain
    })();



    const ELEMENT_NODE = Node.ELEMENT_NODE;



    /** The string that means *none* when it encodes the local part of a Wayscript element's name.
      */
    const ELEMENT_NAME_NONE = '_';



    /** The name that, when it forms the local part of a referential jointer's name,
      * signifies *the same name* as the referent subjoining waybit.
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



    /** Answers whether *ns* identifies a namespace of waybits.
      *
      *     @param ns (string) An XML namespace identifier.
      */
    function isBitNS( ns )
    {
        const n = ns.length;
        const nBit = NS_BIT.length;
        return ( n === nBit || n > nBit && ns.charAt(nBit) === '.' ) && ns.startsWith( NS_BIT );
    }



    /** Answers whether *subId* is a top sub-identifier that identifies a namespace of waybits.
      *
      *     @param subId (string) A sub-identifier.
      *
      *     @see § Namespacing § sub-identifier [S]
      */
    function isBitTopId( subId )
    {
        const n = subId.length;
        const nBit = TOP_ID_BIT.length;
        return ( n === nBit || n > nBit && subId.charAt(nBit) === '.' )
          && subId.startsWith( TOP_ID_BIT );
    }



    /** If *referent* has a *join* attribute of its own, then this function reports *joinV*
      * as double jointing and returns true; else it reports nothing and returns false.
      *
      *     @param joinV (string) The value of a *join* attribute from a jointer.
      *     @param referent (Element) The referent of the *join* attribute,
      */
    function isReportedAsDoubleJointing( joinV, referent )
    {
        if( referent.hasAttributeNS( NS_WAY, 'join' ))
        {
            tsk( 'Double jointing reference, jointer to jointer, ' + a2s('join',joinV) );
            return true;
        }

        return false;
    }



    /** Whether it appears that the user would be unable to correct faults in this program.
      */
    const isUserNonProgrammer = !wasRequestFileSchemed;



    /** Returns the last descendant of the given node, or null if the node is empty.
      *
      *     @see #toLastDescendant
      */
    function lastDescendant( node )
    {
        do { node = node.lastChild } while( node.hasChildNodes() );
        return node;
    }



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



    /** Returns a message (string) that *joinV* yields an incomplete joint because its referent
      * is nowhere in the indicated document.
      *
      *     @param docIndication (string) Either "this document" or "that document"
      *       according to what *joinV* actually refers to.
      *     @param joinV (string) The value of a *join* attribute from a jointer.
      */
    function makeMessage_incompleteJointTo( docIndication, joinV )
    {
        return 'Incomplete joint: No such *id* in ' + docIndication + ' (' + a2s('join',joinV) + ')';
    }



    /** Returns a message (string) that the given Wayscript attribute violates a formal constraint.
      *
      *     @param name (string) The formal name of the attribute.
      *     @param value (string) The actual value of the attribute.
      *     @param violation (string) Terse description of the violation type.
      */
    function makeMessage_malformedAttribute( name, value, violation )
    {
        return 'Malformed Wayscript attribute (' + a2s(name,value) + '): ' + violation;
    }



    /** @param sbj (Element) A subjoining waybit.
      * @param sbjId (string) The subjoining waybit's *id* attribute value.
      * @param sbjDocUri (string) The location of the subjoint document in normal URI form.
      * @param leaderReader (LeaderReader) The leader reader to use, if necessary.
      *
      * @return (string) The subjoint preview string, or an empty string if there is none.
      */
    function makeSubjointPreviewString( sbj, sbjId, sbjDocUri, leaderReader )
    {
        if( sbjId === 'resolve' && sbjDocUri === ROOT_DOCUMENT_URI ) return '';
          // Giving no preview string to commitment jointers.  Their special presentation and easy
          // familiarity to users reduce the need for any description here on the surjoint side.
          // So the subjoining waybit, which is the resolve waybit, may freely describe itself as such,
          // e.g. referring to its particular function or presentation on the *sub*joint side.  Such a
          // description would be inappropriate to replicate in a preview string on the surjoint side.

        leaderReader.read( sbj );
        return leaderReader.leader;
    }



    const MALFORMED_PARAMETER = 'Malformed parameter';



    /** Delay in milliseconds before the first delayed procedure of Inways.
      */
    const MS_DELAY_INWAYS = 49;

    /** Delay in milliseconds before the first delayed procedure of SurjointFinisher.
      */
    const MS_DELAY_SF = MS_DELAY_INWAYS + 142;

    /** Delay in milliseconds before the first delayed procedure of DocumentCachePersistor.
      */
    const MS_DELAY_DCP = MS_DELAY_SF + 1991;



    const NO_BREAK_SPACE = ' '; // Unicode a0



    /** Identifier of the XML namespace of waybits proper.
      */
    const NS_BIT = PARA_NS_WAY + TOP_ID_BIT;



    /** Identifier of the XML namespace of steps.
      */
    const NS_STEP = PARA_NS_WAY + TOP_ID_STEP;



    /** Identifier of the XML top namespace of Wayscript proper.
      */
    const NS_WAY = 'data:,wayscript';



    /** Identifier of the XML namespace of SVG.
      */
    const NS_SVG = 'http://www.w3.org/2000/svg';



    const NULL_PARAMETER = 'Null parameter';



    /** Transforms the given query parameter declaration to a string.
      *
      *     @param name (string) The formal name of the query parameter.
      *     @param value (string) The actual value of the query parameter.
      *
      *     @see #a2s
      */
    function qp2s( name, value ) { return name + '=' + value; }



    /** The CSS *rem* length.
      *
      *     @see https://www.w3.org/TR/css-values/#rem
      */
    const REM = emLength( document.documentElement );



    /** The location of the way root document (string) in normal URI form.
      *
      *     @see URIs#normalized
      */
    const ROOT_DOCUMENT_URI = CAST_ROOT_URI + 'way.xht';



    /** @see JSON#stringify
      */
    const SESSION_STRINGIFY_SPACING = 1; /* Improving the readability of stored content at little cost,
      given that the session's storage space is practically unbounded. */



    const TARGET_SELF = 'self';

    const TARGET_UP   = 'up';

    const TARGET_DOWN = 'down';

    const TARGET_IN   = 'in';

    const TARGET_OUT  = 'out';



    /** Tests whether the given, *id* attribution obeys certain identification constraints.
      * Returns true if it obeys them, otherwise reports the violation and returns false.
      *
      *     @param e (Element) An element with an *id* attribute.
      *     @param id (string) The value of the *id* attribute.
      *
      *     @see http://w3c.github.io/html/dom.html#element-attrdef-global-id
      */
    function testIdentification( e, id )
    {
        if( id === null ) throw NULL_PARAMETER;

        const doc = e.ownerDocument;
        console.assert( e.hasAttribute('id'), A );
        e.removeAttribute( 'id' );
        const eOther = doc.getElementById( id );
        e.setAttribute( 'id', id );
        if( eOther === null ) return true;

        tsk( 'Duplicate *id* declaration, value not unique, ' + a2s('id',id), doc );
        return false;
    }



    const TEXT_NODE = Node.TEXT_NODE;



    /** Moves the given tree walker to the last visible descendant of the current node.
      *
      *     @see #lastDescendant
      *     @see Document Object Model traversal § Visibility of nodes,
      *       https://www.w3.org/TR/DOM-Level-2-Traversal-Range/traversal.html#Iterator-Visibility-h4
      */
    function toLastDescendant( treeWalker ) { while( treeWalker.lastChild() ) {} }



    /** Returns the top sub-identifier of *ns*; or the empty string if *ns* has no sub-identifier
      * because it identifies the top namespace of Wayscript; or null if *ns* has no sub-identifier
      * because it identifies a namespace outside of Wayscript proper.
      *
      *     @param ns (string) An XML namespace identifier.
      *
      *     @see § Namespacing § top sub-identifier [S]
      */
    function topId( ns )
    {
        const nT = NS_WAY.length;
        const n = ns.length;
        if( n < nT ) return null;

        if( n === nT ) return ns === NS_WAY? '': null;
        // else n > nT

        if( ns.charAt(nT) !== '.' ) return null;

        if( ns.startsWith( NS_WAY )) return ns.slice( nT + 1 );

        return null;
    }



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
        tt: for( ;; )
        {
            const t = traversal.nextNode(); // Maintaining *t* as the current element of the traversal
            if( t === null ) break;


          // ============
          // General form of element *t*
          // ============
            const tN = t.localName;
            const tNS = t.namespaceURI;
            const tTopId = topId( tNS );
            let isProperHTML, isProperWayscript, isBit;
            if( tTopId === null )
            {
                isProperHTML = tNS === NS_HTML;
                isProperWayscript = isBit = false;
            }
            else
            {
                isProperHTML = false;
                isProperWayscript = true;
                t.setAttributeNS( NS_READ, 'isProperWayscript', 'isProperWayscript' );
                isBit = isBitTopId( tTopId );
            }


          // ============
          // Hyperlinkage by element *t*
          // ============
            hyperlinkage: if( isProperHTML && tN === 'a' )
            {
                let href = t.getAttribute( 'href' );
                const joinV = t.getAttributeNS( NS_WAY, 'join' );
                let targetExtradocLocN; // Or empty string, as per TargetWhereabouts.documentUri
                if( href !== null ) // Then *t* is a generic hyperlink
                {
                    if( joinV !== null )
                    {
                        tsk( 'An *a* element with both *href* and *join* attributes: '
                          + a2s('href',href) + ', ' + a2s('join',joinV) );
                    }
                    if( !URIs.SCHEMED_PATTERN.test( href )) // Then *href* is not a URI,
                    {                                      // but rather a formally intracast reference.
                        const rep = FormallyIntracastReferencing.malformationReportD( href,
                          DOCUMENT_URI, /*toTestScheme*/false/*already tested in guard above*/ );
                        if( rep !== null ) tsk( makeMessage_malformedAttribute('href', href, rep) );

                        const ref = FormallyIntracastReferencing.removedFromWaycastContext( href );
                        if( href !== ref ) t.setAttribute( 'href', href = ref );
                    }
                }
                else if( joinV !== null ) // Then *t* is a hyperform referential jointer
                {
                    let sbjRef;
                    try { sbjRef = new SubjoiningWaybitReference( DOCUMENT_URI, /*jointer*/t, joinV ); }
                    catch( unparseable )
                    {
                        tsk( unparseable );
                        break hyperlinkage;
                    }

                    const whereabouts = TargetWhereabouts.fromJointer( t, sbjRef );
                    const target = whereabouts.element;
                    if( target === null ) // Then hyperlink target is not in present document
                    {
                        const sbjDocUri = whereabouts.documentUri;
                        if( sbjDocUri.length > 0 ) SurjointFinisher.noteSubjoiningDocument( sbjDocUri );
                        // Else jointer *t* yields a broken (because incomplete) intradocument joint
                    }
                    else if( isReportedAsDoubleJointing( sbjRef.joinV, target ))
                    {
                        t.removeAttributeNS( NS_WAY, 'join' ); /* Anulling the broken (because double)
                          joint declaration to present the would-be jointer *t* instead as a generic
                          (yet unbroken) hyperlink. */
                    }
                    else // Jointer *t* forms an intradocument joint
                    {
                        const direction = whereabouts.direction;
                        console.assert( direction !== null, A );
                        t.setAttributeNS( NS_READ, 'targetDirection', direction );
                    }
                    href = sbjRef.hrefTo( t );
                }
                for( let a = t;; ) // Scan ancestors
                {
                    a = a.parentNode;
                    if( a === document.body ) break;

                    if( a.namespaceURI !== NS_HTML ) continue;

                    const aN = a.localName;
                    if( aN === 'h1' || aN === 'h2' || aN === 'h3'
                     || aN === 'h4' || aN === 'h5' || aN === 'h6' ) break hyperlinkage;
                      // Omitting the hyperstyler in elements with enlarged fonts where it may
                      // present poorly and pose difficulties for the waycaster to defeat.
                }

              // Hyperstyler
              // -----------
                const hyperstyler = document.createElementNS( NS_READ, 'hyperstyler' );
                t.parentNode.insertBefore( hyperstyler, t );
                hyperstyler.appendChild( t );
                const follower = hyperstyler.nextSibling;
                if( follower !== null && follower.nodeType === TEXT_NODE )
                {
                    const offense = ASTERISK_OFFENDING_PATTERN.exec( follower.data );
                    if( offense !== null ) // Then place the offender before the *triggerMark* asterisk
                    {
                        const offender = offense[1];
                        follower.deleteData( 0, offender.length );
                        hyperstyler.appendChild( document.createTextNode( offender ));
                    }
                }
                hyperstyler.appendChild( document.createElementNS( NS_READ, 'triggerMark' ))
                  .appendChild( document.createTextNode( '*' )); // '*' is Unicode 2a (asterisk)
                    // which needs no superscript styling because the font takes care of it.
            }

            if( !isProperWayscript ) continue tt;


          ////////////////////////////////////////////////////////////////////////////  PROPER WAYSCRIPT

            const isDeclaredEmpty = !t.hasChildNodes(); // Captured now, before inserting any markup
            const partTransform = new PartTransformC( t );
            if( isBit )
            {
                t.setAttributeNS( NS_READ, 'isWaybit', 'isWaybit' );
                if( toEnforceConstraints && tN.startsWith('_')
                 && tN !== ELEMENT_NAME_NONE
                 && tN !== ELEMENT_NAME_UNCHANGED ) tsk( 'A waybit with a reserved name: ' + tN );
                if( tTopId === TOP_ID_STEP )
                {
                    const textAligner = document.createElementNS( NS_READ, 'textAligner' );
                    t.insertBefore( textAligner, t.firstChild );
                }
            }


          // ================
          // Bitform jointing by element *t*
          // ================
            const joinV = ( ()=> // *join* attribute, non-null if *t* is a jointer
            {
                let v = t.getAttributeNS( NS_WAY, 'join' );
                if( v === null ) return null;

                if( !isBit )
                {
                    tsk( 'A non-waybit element with a *join* attribute, ' + a2s('join',v) );
                    v = null;
                }
                return v;
            })();
            jointer: if( joinV !== null )
            {
                if( !isDeclaredEmpty )
                {
                    tsk( 'A bitform referential jointer with content, ' + a2s('join',joinV) );
                    break jointer;
                }

                let sbjRef;
                try { sbjRef = new SubjoiningWaybitReference( DOCUMENT_URI, /*jointer*/t, joinV ); }
                catch( unparseable )
                {
                    tsk( unparseable );
                    break jointer;
                }

                const bJ = t.appendChild( document.createElementNS( NS_READ, 'bitformJointing' ));
                const a = bJ.appendChild( document.createElementNS( NS_HTML, 'a' ));
                sbjRef.hrefTo( a );
                const sbjWhereabouts = TargetWhereabouts.fromJointer( t, sbjRef );
                const sbjDocUri = sbjWhereabouts.documentUri;
                let previewString;
                subjoint:
                {
                    if( sbjDocUri.length > 0 ) // Then jointer *t* refers to a separate document
                    {
                        const registration = SurjointFinisher.registerBitformJointer( t,
                          sbjRef.subjointId, sbjDocUri );
                        const image = registration.subjointImage;
                        if( image === null )
                        {
                            partTransform.imaging = 'absent';
                            previewString = '⌚'; // Unicode 231a (watch) = pending symbol
                        }
                        else
                        {
                            partTransform.imaging = 'present';
                            previewString = image.previewString;
                            configureForSubjoint( tNS, tN, joinV, image, partTransform );
                        }
                        break subjoint;
                    }

                    const direction = sbjWhereabouts.direction;
                    if( direction === null ) // Then jointer *t* yields an incomplete joint
                    {
                        previewString = BREAK_SYMBOL;
                        t.setAttributeNS( NS_READ, 'isBroken', 'isBroken' );
                        break subjoint;
                    }

                    // The subjoining waybit is within the present document
                    a.setAttributeNS( NS_READ, 'targetDirection', direction );
                    const sbj = sbjWhereabouts.element;
                    if( isReportedAsDoubleJointing( sbjRef.joinV, sbj )) // … a double joint
                    {
                        previewString = BREAK_SYMBOL;
                        t.setAttributeNS( NS_READ, 'isBroken', 'isBroken' );
                        break subjoint;
                    }

                    configureForSubjoint( tNS, tN, joinV, sbj, partTransform );
                    previewString = makeSubjointPreviewString( sbj, sbjRef.subjointId, sbjDocUri,
                      LeaderReader );
                }
                const preview = a.appendChild( document.createElementNS( NS_READ, 'preview' ));
                preview.appendChild( document.createTextNode( previewString ));
                configureForSubjointPreview( t, preview, previewString );
                a.appendChild( document.createElementNS( NS_HTML, 'br' ));
                a.appendChild( document.createElementNS( NS_READ, 'verticalTruncator' ))
                 .appendChild( document.createElementNS( NS_HTML, 'span' ))
                 .appendChild( document.createTextNode( '⋱⋱' ));
                    // '⋱' is Unicode 22f1 (down right diagonal ellipsis)
            }


         // =========
         // Start tag of element *t*
         // =========
            if( tTopId === /*top NS*/'' && tN === 'group' )
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
            if( isBit )
            {
                const idV = t.getAttribute( 'id' );
                if( idV !== null && testIdentification( t, idV ))
                {
                    SelfHyperlinking.addControls( partTransform.eSTag );
                }
            }
        }
    }



    /** Reports a rule violation or formal fault, such as malformed waysource,
      * that a user with write access to the present document might be able to correct.
      *
      *     @param report (string)
      *     @param doc (Document, optional) The document in which the violation or fault occurs.
      *       Typically this parameter is left undefined.  Otherwise a value that is unequal
      *       to the present document will defeat the function call, causing no report to be sent.
      */
    function tsk( report, doc )
    {
        if( report === null ) throw NULL_PARAMETER;

        if( doc !== undefined )
        {
            if( doc.nodeType !== DOCUMENT_NODE ) throw MALFORMED_PARAMETER;

            if( doc !== document ) return;
        }

        console.warn( report );
        if( isUserEditor ) alert( report ); // See readable.css § TROUBLESHOOTING
    }



    /** The empty string as a parameter for CSSStyleDeclaration.setProperty,
      * which instead has the effect of *removeProperty*.
      *
      *     @see https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-setproperty
      */
    const UNSET_STYLE = '';



    /** Answers whether the browser will lay out the given element in line.
      * Thus is likely to be a slow test.
      */
    function willDisplayInLine( element )
    {
        const ns = element.namespaceURI;
        if( topId(ns) !== null ) return false; // Never is a proper Wayscript element inlined

        const styleDeclarations = getComputedStyle( element );
        const displayStyle = styleDeclarations.getPropertyValue( 'display' );
        if( displayStyle === 'inline' ) return true;

        if( styleDeclarations.length === 0 ) // Then something is wrong
        {
            // Work around it.  Apparent browser bug (Chrome 59).  "All longhand proper-
            // ties that are supported CSS properties" must be reported, ∴ length should
            // be > 0.  https://drafts.csswg.org/cssom/#dom-window-getcomputedstyle
            if( ns === NS_HTML && willDisplayInLine_likely(element) ) return true;
        }

        return false;
    }



    /** Answers whether the browser is very likely to lay out the given HTML element in line.
      * Thus is a fast test.
      */
    function willDisplayInLine_likely( htmlElement )
    {
        switch( htmlElement.localName )
        {
            case 'a':
            case 'abbr':
            case 'b':
            case 'bdi':
            case 'bdo':
            case 'br': // Not displayed at all
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


   //   A l l d o c   S c a n n e r


    /** A scanner of the present document and all related documents.  It scans each for references
      * to the present document, and updates the form of the present document based on the results.
      * It finishes the presentation of referential joints on the subjoint side (figure right).
      *
      *                    surjoint           Surjoint    *
      *                      ancestors          side     *    Subjoint
      *                    ╱                            *       side
      *                   ╱    surjoining              *
      *                  ╱       waybit               *
      *         waybit         ╱                     *
      *                       ╱                     *               subjoining
      *             waybit   ╱                      *                 waybit
      *                                             *               ╱
      *              ┌  waybit                      *              ╱
      *              │      Text content            *             ╱
      *     joint ───┤· · · · · · · · · · · · · · · * · · · · · · · · · · · · · ·
      *              │      waybit                  *     ◉  waybit
      *              └          Text content        *            Text content
      *                     ╱     ⋱⋱                *
      *                    ╱          ╲             *            waybit
      *                   ╱            ╲            *
      *              jointer            ╲           *                waybit
      *            (in bitform)       subjoint      *            ╱
      *                                 preview     *           ╱
      *                                             *          ╱
      *                                            *        subjoint
      *                                           *       descendants
      *                                          *
      *
      *     @see SurjointFinisher, it finishes joints on the surjoint side (figure left).
      */
    const AlldocScanner = ( function()
    {

        const expo = {}; // The public interface of AlldocScanner



        /** Starts this scanner.
          */
        expo.start = function()
        {
            DocumentCachePersistor.addOmnireader( new class extends DocumentReader
            {
                read( cacheEntry, doc ) { scan( doc, cacheEntry.uri ); }
            });
        };



       // - P r i v a t e ------------------------------------------------------------------------------


        /** @param doc (Document) The document to scan, which might be the present document.
          * @param docUri (string) The location of the document in normal URI form.
          *
          *     @see URIs#normalized
          */
        function scan( doc, docUri )
        {
            const traversal = doc.createNodeIterator( doc, SHOW_ELEMENT );
            for( traversal.nextNode()/*onto the document node itself*/;; )
            {
                const t = traversal.nextNode();
                if( t === null ) break;

                const joinV = t.getAttributeNS( NS_WAY, 'join' );
                if( joinV === null ) continue;

                let sbjRef;
                try
                {
                    sbjRef = new SubjoiningWaybitReference( /*srjDocUri*/docUri, /*jointer*/t, joinV );
                }
                catch( unparseable ) { continue; }

                // No need here to fend against other types of malformed reference.
                // Rather take it as the wayscribe intended.
                let sbjDocPath = sbjRef.subjointDocumentPath;
                sbjDocPath = sbjDocPath.length > 0? URIs.normalized(sbjDocPath,/*base*/docUri): docUri;
                if( sbjDocPath !== DOCUMENT_URI ) continue;

                const sbjId = sbjRef.subjointId;
                const sbj = document.getElementById( sbjId );
                if( sbj === null) continue;

              // Finish presentation of referential joint on subjoint side
              // -------------------
                if( sbj.surjointScene ) continue; // Already finished

                if( sbj.hasAttributeNS( NS_WAY, 'join' ) )
                {
                    if( doc !== document ) // Else let *isReportedAsDoubleJointing* issue the report
                    {
                        console.info( 'Ignoring a double jointing reference to jointer #' + sbjId
                          + ' by a jointer in document ' + docUri );
                    }
                    continue;
                }

                sbj.surjointScene = true;
                sbj.setAttributeNS( NS_READ, 'isSubjoining',
                  sbjId === Hyperlinkage.windowTargetedId()? 'window targeted':'window untargeted' );
                const eSTag = asElementNamed( 'eSTag', sbj.firstChild );
                const inway = eSTag.appendChild( document.createElementNS( NS_HTML, 'div' ));
                inway.setAttribute( 'class', 'inway' );
                inway.appendChild( Approaches.makeApproach() );
                const icon = inway.appendChild( document.createElementNS( NS_READ, 'hall' ))
                                  .appendChild( document.createElementNS( NS_READ, 'icon' ));
                icon.appendChild( document.createElementNS( NS_HTML, 'span' ))
                    .appendChild( document.createTextNode( '\u{1f78b}' ));
                      // Unicode 1f78b (round target)
                icon.appendChild( document.createElementNS( NS_READ, 'bullseye' ));
                Inways.layWhen( inway, eSTag );
            }
        }



        return expo;

    }() );



   // ==================================================================================================
   //   A p p r o a c h e s


    /** Dealing with *approaches*.  The *approach* is an inway component that draws vector graphics
      * for a subjoining waybit and controls the scene switching for it.
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



        /** Constructs an inway *approach*.
          */
        expo.makeApproach = function()
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



        /** The smallest width in which an *approach* can correctly draw itself.
          */
        expo.minimumWidth = function() { return MIN_WIDTH; };



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
            const midY = height / 2; // Vertically centred
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
      *     triggerPath · Identifier (string in XPath form) of the nominal hyperlink trigger
      *                   whose activation caused the latest exit from the present entry
      *                   of the session history.  It is null if the present entry was never exited,
      *                   and null if the latest exit had some other cause.
      *                       or its last exit had some other cause.
      *     targetDirection · Q.v. under § MARKUP INSERTS § html:html
      *     travel          · Ordinal (number) of the present entry within the session history,
      *                       a number from zero (inclusive) to the history length (exclusive).
      *
      * @see § FORMATION of SESSION HISTORY STATE
      */
    const Breadcrumbs = ( function()
    {

        const expo = {}; // The public interface of Breadcrumbs



        /** @param t (Element) The nominal hyperlink trigger on which to drop the crumb.
          */
        expo.dropCrumb = function( t )
        {
            travelStop.trigger = t;
            dropCrumb_store( definitePath(t) );
            if( crumbShower === t ) return; // None is showing, or none other than *t*

            hideCrumb(); // Removed above and dropped on *t*, it is no longer where it appears to be
        };


            function dropCrumb_store( p ) // p → statelet property Breadcrumbs.triggerPath
            {
                const state = history./*copy of*/state;
                console.assert( state !== null, A ); // Assured by *reorient*
                const statelet = state[NS_READ].Breadcrumbs;
                console.assert( statelet !== undefined, A ); // Assured by *reorient*
                if( statelet.triggerPath === p ) return; // Already stored

                statelet.triggerPath = p;
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
            for( let t = click.target; t !== document.body; t = t.parentNode )
            {
                if( t.namespaceURI !== NS_HTML ) continue;

                if( t.localName !== 'a'/*hyperlink trigger*/ ) continue;

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
                statelet.triggerPath = null; // Properly formed, as per Breadcrumbs contract
                statelet.travel = travel;
                statelet.targetDirection = ( ()=>
                {
                    Hyperlinkage.refresh();
                    const windowTargetedElement = Hyperlinkage.windowTargetedElement();
                    if( windowTargetedElement === null ) return null;

                    const previousStop = travelStops[travel-1];
                    if( previousStop === undefined ) return TARGET_OUT;

                    const trigger = previousStop.trigger;
                    if( trigger === null )  return TARGET_IN;

                    if( trigger === windowTargetedElement ) return TARGET_SELF;

                    const dP = trigger.compareDocumentPosition( windowTargetedElement );
                    if( dP & DOCUMENT_POSITION_PRECEDING ) return TARGET_UP;

                    console.assert( dP & DOCUMENT_POSITION_FOLLOWING, A );
                    return TARGET_DOWN;
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

                const p = statelet.triggerPath;
                if( p === null )
                {
                    hideCrumb();
                    break sC;
                }

                const pR = document.evaluate( p, document, /*namespace resolver*/null,
                  ORDERED_NODE_ITERATOR_TYPE, /* XPathResult to reuse*/null );
                const s = pR.iterateNext(); // Resolved hyperlink trigger
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

            constructor() { this._trigger = null; }


            /** The nominal hyperlink trigger (Element) whose activation caused the latest exit
              * from this stop.  It is null if the stop was never exited during the present load
              * of the document, and null if the latest exit had some other cause.
              *
              *     @see Statelet property Breadcrumbs.triggerPath
              */
            get trigger() { return this._trigger; }
            set trigger( _ ) { this._trigger = _; }

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
            if( travelStop.trigger === null )
            {
                dropCrumb_store( null ); /* Clear any *triggerPath* from the statelet
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
              *     @param document (Document, see #document)
              *     @param uri (string, see #uri)
              *     @param readers (Array of DocumentReader, see #readers)
              */
            constructor( document, uri, readers )
            {
                this._document = document;
                this._uri = uri;
                this._readers = readers;
            }



            /** The cached document, or null if document storage is pending or failed.
              *
              *     @return (Document)
              */
            get document() { return this._document; }
            set document( _ ) { this._document = _; }



            /** The location of the document in normal URI form.
              *
              *     @return (string)
              *     @see URIs#normalized
              */
            get uri() { return this._uri; }



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
          *     @param docUri (string) The document location in normal URI form.
          *     @param reader (DocumentReader)
          *
          *     @see URIs#normalized
          */
        expo.readNowOrLater = function( docUri, reader )
        {
            if( URIs.isDetectedAbnormal( docUri )) throw URIs.makeMessage_abnormal( docUri );

            let entry = entryMap.get( docUri );
            if( entry !== undefined ) // Then the document was already requested
            {
                const readers = entry.readers;
                if( readers !== null ) readers.push( reader );
                else notifyReader( reader, entry );
                return;
            }

            const readers = [];
            entry = new DocumentCacheEntry( /*document*/null, docUri, readers );
            readers.push( reader );
            entryMap.set( docUri, entry );

          // ===================
          // Configure a request for the document
          // ===================
            const req = new XMLHttpRequest();
            req.open( 'GET', docUri, /*async*/true ); // Misnomer; opens nothing, only sets config
         // req.overrideMimeType( 'application/xhtml+xml' );
         /// Still it parses to an XMLDocument (Firefox 52), unlike the present document
            req.responseType = 'document';
            req.timeout = docUri.startsWith('file:')? 2000: 8000; // ms

          // ===========
          // Stand ready to catch the response
          // ===========
            req.onabort = ( _event/*ignored*/ ) =>
            {
                console.warn( 'Document request aborted: ' + docUri );
            };
            req.onerror = ( _event/*ignored*/ ) =>
            {
                // Parameter *_event* is a ProgressEvent, at least on Firefox,
                // which contains no useful information on the specific cause of the error.

                console.warn( 'Document request failed: ' + docUri );
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
                    if( id !== null ) testIdentification( t, id );
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
                console.warn( 'Document request timed out: ' + docUri );
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



        entryMap.set( DOCUMENT_URI, // Storing the present document
          new DocumentCacheEntry( document, DOCUMENT_URI, /*readers*/null ));
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

              // Re-cache the recalled documents
              // --------
                for( const uri of locations )
                {
                    if( !isPresentDocumentMemorized && uri === DOCUMENT_URI )
                    {
                        isPresentDocumentMemorized = true;
                        continue; // Always the present document is already cached
                    }

                    DocumentCache.readNowOrLater( uri, DOCUMENT_READER_NULL ); // Re-caching it
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
                    if( cacheEntry.document !== null ) locations.push( cacheEntry.uri );
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
   //   F o r m a l l y   I n t r a c a s t   R e f e r e n c i n g


    /** Dealing with formally intracast references.
      *
      *     @see http://reluk.ca/project/wayic/cast/doc.task § Formally intracast reference
      */
    const FormallyIntracastReferencing = ( function()
    {

        const expo = {}; // The public interface of FormallyIntracastReferencing



        /** Tests the form of the given URI reference against the constraints
          * of formally intracast referencing and returns a report of any violation it finds.
          *
          * This is a convenience function.  If you already have an equivalent reference
          * in parsed form (refU), then a direct call to *malformationReportU* will be more efficient.
          *
          *     @param ref (string) A URI reference.
          *     @param refDocUri (string) The location of the referring document,
          *       the one containing the reference, in URI form.
          *     @param toTestScheme (boolean, optional) Whether to test for the presence
          *       of a scheme component.  The default value is true.
          *
          *     @return (string) The violation report, or null if no violation was found.
          *
          *     @see URI-reference, https://tools.ietf.org/html/rfc3986#section-4.1
          *     @see URI,           https://tools.ietf.org/html/rfc3986#section-3
          */
        expo.malformationReportD = function( ref, refDocUri, toTestScheme = true )
        {
            return malformationReport( ref, new URL(ref, /*base*/refDocUri), toTestScheme );
        };



        /** Tests the form of the given URI reference against the constraints
          * of formally intracast referencing and returns a report of any violation it finds.
          *
          *     @param ref (string) A URI reference.
          *     @param refU (URL) The same or equivalent reference in parsed form. [UAU]
          *     @param toTestScheme (boolean, optional) Whether to test for the presence
          *       of a scheme component.  The default value is true.
          *
          *     @return (string) The violation report, or null if no violation was found.
          *
          *     @see URI-reference, https://tools.ietf.org/html/rfc3986#section-4.1
          */
        expo.malformationReportU = function( ref, refU, toTestScheme = true )
        {
            return malformationReport( ref, refU, toTestScheme );
        };



        /** Translates the given, formally intracast reference from its native waycast context
          * to the context of the present document, and returns the result.
          *
          *     @param ref (string) A formally intracast reference.
          *
          *     @return (string) An equivalent reference in document context,
          *       formed as a relative-path reference, possibly equal to the given *ref*.
          *
          *     @see relative-path reference, https://tools.ietf.org/html/rfc3986#section-4.2, -3.3
          */
        expo.removedFromWaycastContext = function( ref )
        {
            if( URIs.isRelative_pathAbsolute( ref )) ref = CAST_ROOT_PATH + ref;
            return ref;
        };



       // - P r i v a t e ------------------------------------------------------------------------------


        function malformationReport( ref, refU, toTestScheme )
        {
            if( toTestScheme && URIs.SCHEMED_PATTERN.test( ref )) // Not refU, it is always schemed
            {
                return 'Not formally intracast; not a relative URI, has a scheme component';
            }

            if( URIs.DOT_SEGMENTED_PATTERN.test( ref )) // Not refU, it might be normalized free of dots
            {
                return 'Not formally intracast, contains a dot segment';
            }

            // Any of these tests might be done on string form *ref*, as opposed to parsed form *refU*.
            // Yet testing the parsed form has advantages in clarity and robustness.
            const pp = refU.searchParams;
            if( pp.has( 'import' ))
            {
                return 'Import parameter not yet supported (' + qp2s('import',pp.get('import')) + ')';
            }

            return null;
        }



        return expo;

    }() );



   // ==================================================================================================
   //   H y p e r l i n k a g e


    /** Dealing with hyperlinks.
      */
    const Hyperlinkage = ( function()
    {

        const expo = {}; // The public interface of Hyperlinkage



        /** Immediately updates the Hyperlinkage state, rather than wait for an event
          * that might yet be pending.
          */
        expo.refresh = function() { hearHashChange.call( /*this*/window ); };



        /** The window targeted element, or null if there is none.  This is the element indicated
          * by the value of window.location.hash, or null if that value is an empty string
          * or it indicates an element does not exist.
          *
          *     @return (Element)
          *     @see http://reluk.ca/project/wayic/web/target
          */
        expo.windowTargetedElement = function() { return windowTargetedElement; };


            let windowTargetedElement = null;


            function clearWindowTargetedElement()
            {
                if( windowTargetedElement === null ) return;

                if( windowTargetedElement.hasAttributeNS( NS_READ, 'isSubjoining' ))
                {
                    windowTargetedElement.setAttributeNS( NS_READ, 'isSubjoining',
                      'window untargeted' );
                }
                windowTargetedElement = null;
            }


            function setWindowTargetedElement( e )
            {
                if( windowTargetedElement === e ) return;

                if( windowTargetedElement !== null
                 && windowTargetedElement.hasAttributeNS( NS_READ, 'isSubjoining' ))
                {
                    windowTargetedElement.setAttributeNS( NS_READ, 'isSubjoining',
                      'window untargeted' );
                }
                if( e.hasAttributeNS( NS_READ, 'isSubjoining' ))
                {
                    e.setAttributeNS( NS_READ, 'isSubjoining', 'window targeted' );
                }
                windowTargetedElement = e;
            }



        /** The window targeted identifier, or null if there is none.  This is the value
          * of window.location.hash without a preceding delimiter character '#', or null
          * if that value is an empty string.
          *
          *     @return (string)
          *     @see http://reluk.ca/project/wayic/web/target
          */
        expo.windowTargetedId = function() { return windowTargetedId; };


            let windowTargetedId = null;



       // - P r i v a t e ------------------------------------------------------------------------------


        function hearHashChange/* event handler */( _HashChangeEvent )
        {
            // † Use of *refresh* may cause redundant calls, as detected and marked below †

            const hash = location.hash; // [WDL]
            if( hash.length <= 1 )
            {
                if( windowTargetedId !== null ) // Otherwise this call is redundant †
                {
                    windowTargetedId = null;
                    clearWindowTargetedElement();
                }
                return;
            }

            const id = hash.slice( 1 );
            if( windowTargetedId === id ) return; // This call is redundant †

            windowTargetedId = id;
            const e = document.getElementById( id );
            if( e === null ) clearWindowTargetedElement();
            else setWindowTargetedElement( e );
        }



        window.addEventListener( 'hashchange', hearHashChange );
        expo.refresh(); // Initializing
        return expo;

    }() );



   // ==================================================================================================
   //   I n w a y s


    /** Dealing with inways.  Formally the inway is a component the start tag (eSTag) of a subjoining
      * waybit (sbj* in figure below).  Apparently however it lies outside of the tag to the left,
      * where it spans the distance from the page edge to the tag.
      *
      *          ┌·················· eSTag ···················┐
      *                                                       ⋮
      *          ┌————————————— inway ———————————————┐        ⋮
      *                                         hall         tag name
      *          ┌———————— approach ————————┐  ┌—————┐       ╱⋮
      *          ⋮                          ⋮  ⋮     ⋮      ╱ ⋮
      *          ⋮                          ⋮  ⋮  1waybit  ╱  ⋮
      *          ⋮                          ⋮  ⋮     ⋮    ╱   ⋮
      *                                         ·     11sbj
      *                                                   Content of 11sbj
      *                                           2waybit
      *                                               Content of 2waybit, a non-subjoining waybit
      *                                       ·   3sbj
      *                                               Content of 3sbj
      *
      *
      * When the pointer (↖) crosses any part of the eSTag (including the inway approach),
      * the subjoint icon reveals itself in full:
      *
      *          ┌············································┐
      *          ┌———————————————————————————————————┐        ⋮
      *          ┌——————————————————————————┐  ┌—————┐        ⋮
      *          ⋮                          ⋮  ⋮     ⋮        ⋮
      *          ⋮                          ⋮  ⋮  1waybit     ⋮
      *          ⋮                          ⋮  ⋮     ⋮        ⋮
      *                                         ◉     11sbj
      *                        ↖               ╱          Content of 11sbj
      *                                       ╱   2waybit
      *                                      ╱        Content of 2waybit, a non-subjoining waybit
      *                                     ╱ ·   3sbj
      *                                    ╱          Content of 3sbj
      *                              subjoint
      *                                icon
      *
      *
      * If the subjoint icon is clicked, or somehow else the window targets the subjoining waybit,
      * then the inway approach becomes visible:
      *
      *          ┌———————— approach ————————┐  ┌—————┐
      *          ⋮                          ⋮  ⋮     ⋮
      *          ⋮                          ⋮  ⋮  1waybit
      *          ⋮                          ⋮  ⋮     ⋮
      *           ∙ ·  ·   ·    ·     ·         ◉     11sbj
      *          ╱       │                                Content of 11sbj
      *         ╱        │                        2waybit
      *     edging       │                            Content of 2waybit, a non-subjoining waybit
      *                 path                  ·   3sbj
      *                                               Content of 3sbj
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



        /** The maximum, nominal gap between the inway *approach* and the *hall* sibling to its right.
          * The actual visual gap may be wider depending on how the *approach* draws its content.
          */
        const MAX_GAP = 1.5/*rem*/ * REM; // Within which the pointer style defaults, so indicating
                                         // that the two components have distinct control functions.


        /** The minimum, nominal gap between the inway *approach* and the *hall* sibling to its right.
          */
        const MIN_GAP_REM = 0.6; // Changing? sync'd → readable.css

        const MIN_GAP = MIN_GAP_REM * REM;



        return expo;

    }() );



   // ==================================================================================================
   //   L e a d e r   R e a d e r


    /** A reader of element leaders.  An element leader is the whitespace collapsed, text content
      * of the element prior to any forced line break or element of non-inline layout.
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
          */
        expo.read = function( element, maxLength=Number.MAX_VALUE )
        {
            let leader = '';
            let hasLeader = false;
            expo.isTruncated = false;
            const dive = document.createTreeWalker( element );
              // Node.innerText and textContent would be too inefficient for this purpose, often diving
              // deeply into the element hierarchy where only a shallow dive is needed.
            let headroom = maxLength; // Space remaining for the next word
            let toMarkEllipse = false; // Whether a text omission has yet to be marked
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
                            break dive; // Terminating the leader
                        }

                        if( leader.length > 0 ) // Then first append a word separator
                        {
                            if( toMarkEllipse )
                            {
                                leader += '…'; // Unicode 2026 (horizontal ellipsis)
                                toMarkEllipse = false;
                            }
                            else leader += ' ';
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
                    if( dNS === NS_READ )
                    {
                      // Non-HTML insert
                      // ---------------
                        switch( d.localName )
                        {
                            case 'bitformJointing': // For the content of its *preview* element, below
                            case 'hyperstyler':     // For the content of its HTML *a* child
                            case 'preview':
                                continue dive; // Not bypassing *d* content
                        }

                        toLastDescendant( dive ); // Bypassing *d* content
                        continue;
                    }

                    if( dNS === NS_HTML )
                    {
                        switch( d.localName )
                        {
                          // Forced line break
                          // -----------------
                            case 'br':
                                break dive; // Terminating the leader

                          // Significant markup unencodable in plain text
                          // ------------------
                            case 'bdi':
                            case 'bdo':
                            case 'del':
                            case 's':
                            case 'sub':
                            case 'sup':
                                toMarkEllipse = true;
                                toLastDescendant( dive ); // Bypassing *d* content
                                continue dive;
                        }
                    }

                  // Non-inlined element
                  // -------------------
                    if( !willDisplayInLine( d )) break dive; // Terminating the leader
                }
            }

            expo.element = element;
            expo.leader = leader;
            expo.hasLeader = hasLeader;
        };



        return expo;

    }() );




   // ==================================================================================================
   //   P a r t   T r a n s f o r m   C


    /** The part of a proper Wayscript element's transformation that is generally open to being redone.
      * This is a disposable, single-use class.
      */
    class PartTransformC
    {


        /** Constructs a PartTransformC.
          *
          *     @param element (Element) The proper Wayscript element to transform.
          */
        constructor( element )
        {

           // - i n p u t - / - c o n f i g u r a t i o n - - - - - - - - - - - - - - - - - - - - - - -

            this.element = element;


            /** A non-null value indicates a tranformation that might actually be redone.
              * Meantime the form is either based on a cached image of a subjoining waybit
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
            LeaderReader.read( e, /*maxLength*/0 );
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
            const eNS = e.namespaceURI;
            let isAnonymous = false;
            let lp = this.localPartOverride;
            localPart:
            {
                const eN = e.localName;
                if( lp === null /* no override */) lp = eN;
                else if( lp.length === 0 /* empty override, e.g. unqualified group */) break localPart;

              // name masking
              // - - - - - - -
                let mask = null;
                const isMaskable = eN.length == 1 || !eN.startsWith('_'); /* In case of a waybit,
                  its name must be either '_' or non-reserved. § Name masking attribute [S] */
                if( isMaskable ) for( let a = e;; ) // Seek mask declaration in self and ancestors
                {
                    if( a.localName === eN && a.namespaceURI === eNS )
                    {
                        mask = a.getAttributeNS( NS_WAY, 'nameMask' );
                        if( mask !== null )
                        {
                            if( mask === 'unset' ) mask = null;
                            break;
                        }
                    }

                    a = a.parentNode;
                    if( a === document.body ) break;
                }

              // name assignment
              // - - - - - - - -
                if( mask !== null )
                {
                    lp = mask;
                    eName.setAttribute( 'class', 'wideCharacterSpace' );
                }
                else if( lp === ELEMENT_NAME_NONE )
                {
                    isAnonymous = true;
                    eQName.setAttributeNS( NS_READ, 'isAnonymous', 'isAnonymous' );
                    lp = '●'; // Unicode 25cf (black circle) to serve as a bullet
                    eName.setAttribute( 'class', 'wideCharacterSpace' );
                }
                else if( !lp.startsWith( '_' )) lp = lp.replace( /_/g, NO_BREAK_SPACE );
                  // Starts with a non-underscore, hopefully followed by some other visible content?
                  // Then replace any underscores with nonbreaking spaces for sake of readability.
                eName.appendChild( document.createTextNode( lp ));
            }

          // formation of name
          // - - - - - - - - -
            let presentedName, maxShort;
            if( eNS === NS_STEP )
            {
                presentedName = isAnonymous && !isPrefixAnonymousOrAbsent? prefix: lp;
                maxShort = 1; // Less to allow room for extra padding that readable.css adds
            }
            else
            {
                presentedName = lp;
                maxShort = 2;
            }
            const presentedNameLength = presentedName.length;
  /*[C2]*/  if( presentedNameLength <= maxShort )
            {
                let value = '0';
                while( value.length <= presentedNameLength ) value += value.length;
                  // Yields '0', '01' or '012' according to presented length
                e.setAttributeNS( NS_READ, 'presentsShortName', value );
            }
        }


    }



   // ==================================================================================================
   //   P a r t   T r a n s f o r m   C 2


    /** The redoing of a PartTransformC.
      */
    class PartTransformC2 extends PartTransformC
    {

        /** Constructs a PartTransformC2, first removing the markup of the earlier PartTransformC.
          *
          *     @param element (Element) The element transformed in the earlier PartTransformC.
          */
        constructor( element )
        {
            super( element );
            const eSTag = asElementNamed( 'eSTag', element.firstChild );
            if( eSTag === null ) throw 'Missing eSTag';

            element.removeChild( eSTag );

            // Remove any attributes that might have been set:
            element.removeAttributeNS( NS_READ, 'hasLeader' );
            element.removeAttributeNS( NS_READ, 'presentsShortName' );
            element.removeAttributeNS( NS_READ, 'imaging' );
        }

    }




   // ==================================================================================================
   //   S e l f   H y p e r l i n k i n g


    /** Window targeting for self hyperlinked waybits.
      */
    const SelfHyperlinking = ( function()
    {

        const expo = {}; // The public interface of SelfHyperlinking



        /** Adds controls to a waybit.
          *
          *     @param eSTag (Element) The start tag of the waybit.
          */
        expo.addControls = function( eSTag ) { eSTag.addEventListener( 'click', hearClick ); };



       // - P r i v a t e ------------------------------------------------------------------------------


        /** @param click (MouseEvent) A click event from within the start tag.
          */
        function hearClick/* event handler */( click )
        {
            // ◉ : Parts below marked ◉ apply only where the clicked waybit is subjoining

            const eSTag = click.currentTarget; // Where listening
            const eClicked = click.target;    // What got clicked

          // =====================
          // Empty container space clicked?  No function
          // =====================
            if( eClicked === eSTag ) return; // Start tag element itself, as opposed to a descendant

            const eClickedNS = eClicked.namespaceURI; // ◉
            if( eClicked.parentNode === eSTag && eClicked.localName === 'div'
             && eClickedNS === NS_HTML ) return; // Inway element itself, as opposed to a descendant

          // ================
          // Inway *approach* clicked?  Function is scene switching  ◉
          // ================
            const bit = eSTag.parentNode; // Waybit
            const windowTargetedElement = Hyperlinkage.windowTargetedElement();
            if( eClickedNS === NS_SVG ) // inway approach
            {
                if( bit !== windowTargetedElement ) return; // Switch is disabled

                const u = new URL( location.toString() ); // [WDL]
                u.hash = ''; // Remove the fragment
                const pp = u.searchParams; /* Anticipating implementation of ./project.task
                  § Bidirectional traversal of referential joints § scene selection model */
                pp.set( 'scn', 'srj' );
                pp.set( 'bit', bit.getAttribute('id') );
             // history.replaceState( history./*duplicate of*/state, /*no title*/'', u.href ); // TEST
                return;
            }

          // ==============================
          // Start tag name or inway *hall* (◉) clicked:  Function is self hyperlinking
          // ==============================
            const view = document.scrollingElement; // Within the viewport
            const scrollTopWas = view.scrollTop;
            const scrollLeftWas = view.scrollLeft;

          // Drop a breadcrumb before changing location
          // -----------------
            Breadcrumbs.dropCrumb( bit );

          // Toggle the browser location, window targeted ⇄ window untargeted
          // ---------------------------
            if( bit === windowTargetedElement ) // Δ: window targeted → window untargeted
            {
                location.hash = ''; // Untargeting
                const loc = location.toString(); // [WDL]
                if( loc.endsWith( '#' )) // Then it left the fragment delimiter hanging there, visible,
                {                 // like the grin of the Cheshire Cat (Firefox, Chrome).  Remove it:
                    history.replaceState( history./*duplicate of*/state, /*no title*/'',
                      loc.slice(0,-1) );
                }
            }
            else location.hash = bit.getAttribute( 'id' ); // Δ: window untargeted → window targeted

          // Stabilize the view within the viewport
          // ------------------
            view.scrollTop = scrollTopWas;
            view.scrollLeft = scrollLeftWas;
        }



        return expo;

    }() );



   // ==================================================================================================
   //   S u b j o i n i n g   W a y b i t   R e f e r e n c e


    /** @see § Subjoining waybit reference [S]
      */
    class SubjoiningWaybitReference
    {


        /** Constructs a SubjoiningWaybitReference from a referential jointer.
          *
          *     @param srjDocUri (string) The location of the surjoint document,
          *       the one containing the referential jointer, in URI form.
          *     @param jointer (Element) The referential jointer.
          *     @param joinV (string, see #joinV)
          *
          *     @throws (string) Error message if the reference declaration is malformed.
          */
        constructor( srjDocUri, jointer, joinV )
        {
            this._joinV = joinV;
            let sbjDocRef = URIs.defragmented( joinV );
            {
                const fragment = joinV.slice( sbjDocRef.length + 1 );
                if( fragment === '' ) throw "Missing fragment sign '#' (" + a2s('join',joinV) + ')';

                this._subjointId = fragment;
            }
            if( sbjDocRef.length > 0 )
            {
                const r = FormallyIntracastReferencing.malformationReportD( sbjDocRef, srjDocUri );
                if( r !== null ) throw makeMessage_malformedAttribute( 'join', joinV, r );

                sbjDocRef = FormallyIntracastReferencing.removedFromWaycastContext( sbjDocRef );
            }
            this._subjointDocumentPath = sbjDocRef;
        }



        /** Sets on the given element an *href* attribute that refers to the same subjoining waybit
          * as does this reference.
          *
          *     @return (string) The value of the attribute as set.
          */
        hrefTo( element )
        {
            const href = this._subjointDocumentPath + '#' + this._subjointId;
            element.setAttribute( 'href', href );
            return href;
        }



        /** The value of the *join* attribute (string) as declared.
          */
        get joinV() { return this._joinV; }



        /** The location of the subjoint document (string) as a relative-path reference, which is
          * the empty string if the *join* attribute is a fragment-only, same-document reference.
          *
          *     @see relative-path reference, https://tools.ietf.org/html/rfc3986#section-4.2, -3.3
          *     @see Same-document reference, https://tools.ietf.org/html/rfc3986#section-4.4
          */
        get subjointDocumentPath() { return this._subjointDocumentPath; }



        /** The identifier of the subjoining waybit.
          */
        get subjointId() { return this._subjointId; }


    }



   // ==================================================================================================
   //   S u b j o i n t   I m a g e


    /** The image of a subjoining waybit for use in subjoint previews.
      */
    class SubjointImage
    {


        /** Constructs a SubjointImage.
          *
          *     @param localName    (see Element#localName)
          *     @param namespaceURI (see Element#namespaceURI)
          *     @param previewString (string, see #previewString)
          */
        constructor( localName, namespaceURI, previewString )
        {
            if( !localName/*[UN]*/ || !namespaceURI/*[UN]*/
             || previewString === undefined || previewString === null ) throw MALFORMED_PARAMETER;

            this._localName = localName;
            this._namespaceURI = namespaceURI;
            this._previewString = previewString;
        }



        /** Answers whether this image equals another.
          *
          *     @param other (SubjointImage) The other image, which may be null.
          */
        equals( other )
        {
            if( other === null ) return false;

            return this._previewString === other.previewString
              && this._localName === other.localName
              && this._namespaceURI === other.namespaceURI;
        }



        /** @see Element#localName
          */
        get localName() { return this._localName; }



        /** @see Element#namespaceURI
          */
        get namespaceURI() { return this._namespaceURI; }



        /** The subjoint preview string, or an empty string if there is none.
          *
          *     @see #makeSubjointPreviewString
          */
        get previewString() { return this._previewString; }


    }



   // ==================================================================================================
   //   S u b j o i n t   I m a g e   C a c h e


    const SubjointImageCache = ( function() // [SIC]
    {

        const expo = {}; // The public interface of SubjointImageCache



        /** Retrieves the image of the indicated subjoining waybit.
          *
          *     @param sbjUri (string) The location of the subjoining waybit in normal URI form.
          *     @return (SubjointImage) The cached image, or null if none is cached.
          *
          *     @see URIs#normalized
          */
        expo.read = function( sbjUri )
        {
            const s = sessionStorage.getItem( SS_KEY_PREFIX + sbjUri );
            if( s !== null )
            {
                const o = JSON.parse( s ); // Yields object form (o) of original image stored
                try { return new SubjointImage( o._localName, o._namespaceURI, o._previewString ); }

                catch( x )
                {
                    if( isUserNonProgrammer || x !== MALFORMED_PARAMETER ) throw x;

                    console.warn( 'Suppressing an exception expected only while programming: ' + x );
                }
            }

            return null;
        };



        /** Stores the image of the indicated subjoining waybit.
          *
          *     @param sbjUri (string) The location of the subjoining waybit in normal URI form.
          *     @param image (SubjointImage)
          *
          *     @see URIs#normalized
          */
        expo.write = function( sbjUri, image )
        {
            if( URIs.isDetectedAbnormal( sbjUri )) throw URIs.makeMessage_abnormal( sbjUri );

            if( image === null ) throw NULL_PARAMETER;

            sessionStorage.setItem( SS_KEY_PREFIX + sbjUri,
              JSON.stringify( image, /*replacer*/null, SESSION_STRINGIFY_SPACING ));
        };



       // - P r i v a t e ------------------------------------------------------------------------------


        /** Common prefix of any session storage key (string)
          * for a cached subjoint image (JSON stringified SubjointImage).
          */
        const SS_KEY_PREFIX = NS_READ + '.SubjointImageCache.';



        return expo;

    }() );



   // ==================================================================================================
   //   S u r j o i n t   F i n i s h e r


            class SurjointFinisher_Registration
            {

                /** Constructs an SurjointFinisher_Registration.
                  *
                  *     @param jointer (Element, see #jointer)
                  *     @param subjointId (string, see #subjointId)
                  *     @param subjointDocUri (string) The location of the subjoint document
                  *       in normal URI form.
                  *
                  *     @see URIs#normalized
                  */
                constructor( jointer, subjointId, subjointDocUri )
                {
                    this._jointer = jointer;
                    this._subjointId = subjointId;
                    this._subjointImage = SubjointImageCache.read( subjointDocUri + '#' + subjointId );
                }


                /** The referential jointer (Element).
                  */
                get jointer() { return this._jointer; }


                /** The image of the subjoining waybit (SubjointImage) as retrieved from the cache,
                  * or null if none was cached.
                  */
                get subjointImage() { return this._subjointImage; }


                /** The identifier of the subjoining waybit (string) within the subjoint document.
                  */
                get subjointId() { return this._subjointId; }

            }



    /** A combined *presentation finisher* and *image pre-cacher* for interdocument referential joints.
      * It finishes the presentation of bitform joints on the surjoint side (figure left).
      *
      *                    surjoint           Surjoint    *
      *                      ancestors          side     *    Subjoint
      *                    ╱                            *       side
      *                   ╱    surjoining              *
      *                  ╱       waybit               *
      *         waybit         ╱                     *
      *                       ╱                     *               subjoining
      *             waybit   ╱                      *                 waybit
      *                                             *               ╱
      *              ┌  waybit                      *              ╱
      *              │      Text content            *             ╱
      *     joint ───┤· · · · · · · · · · · · · · · * · · · · · · · · · · · · · ·
      *              │      waybit                  *     ◉  waybit
      *              └          Text content        *            Text content
      *                     ╱     ⋱⋱                *
      *                    ╱          ╲             *            waybit
      *                   ╱            ╲            *
      *              jointer            ╲           *                waybit
      *            (in bitform)       subjoint      *            ╱
      *                                 preview     *           ╱
      *                                             *          ╱
      *                                            *        subjoint
      *                                           *       descendants
      *                                          *
      *
      * It pre-caches any images that will be needed by directly subjoint documents (all forms of joint)
      * should the user travel to them. [SIC]
      *
      *     @see AlldocScanner, it finishes joints on the subjoint side (figure right).
      *     @see SubjointImage
      */
    const SurjointFinisher = ( function()
    {

        const expo = {}; // The public interface of SurjointFinisher



        /** Tells this finisher of a separate document joined directly to the present document
          * by a non-bitform jointer.
          *
          *     @param uri (string) The location of the subjoint document in normal URI form.
          *
          *     @see #registerBitformJointer
          *     @see URIs#normalized
          */
        expo.noteSubjoiningDocument = function( uri ) { registerSubjoiningDocument( uri ); };



        /** Registers an unresolved, interdocument bitform joint and returns the registration.
          *
          *     @param jointer (Element) A bitform jointer that joins across documents.
          *     @param subjointId (string) The identifier of the subjoining waybit
          *       within the subjoint document.
          *     @param subjointDocUri (string) The location of the subjoint document in normal URI form.
          *
          *     @return (SurjointFinisher_Registration)
          *
          *     @see URIs#normalized
          */
        expo.registerBitformJointer = function( jointer, subjointId, subjointDocUri )
        {
            const reg = new SurjointFinisher_Registration( jointer, subjointId, subjointDocUri );
            const regList = registerSubjoiningDocument( subjointDocUri );
            regList.push( reg );
            return reg;
        };



        /** Starts this finisher.
          */
        expo.start = function()
        {
            start1_presentDocument( jointRegistry );
            setTimeout( start2_subjoiningDocuments, MS_DELAY_SF/*browser rest*/, jointRegistry );
            jointRegistry = null; /* Freeing it for eventual garbage collection,
              and blocking henceforth any further attempt to register */
        };



       // - P r i v a t e ------------------------------------------------------------------------------


        /** Map of interdocument joints.  The key to each entry is the location (string,
          * in normal URI form) of a directly subjoint document.  The value is a registration list
          * (Array of SurjointFinisher_Registration), one for each bitform jointer (if any)
          * of the present document that refers to the keyed document.  The keys cover
          * all referentially subjoint documents regardless of how their joints are formed,
          * while the values' registration lists cover only bitform jointers.
          *
          *     @see URIs#normalized
          */
        let jointRegistry = new Map(); // Nulled on *start*



        const MYSTERY_SYMBOL = '?';



        /** @param uri (string) The location of the subjoining (directly subjoint) document
          *   in normal URI form.
          * @return (Array of SurjointFinisher_Registration)
          *
          * @see URIs#normalized
          */
        function registerSubjoiningDocument( uri )
        {
            let regList = jointRegistry.get( uri );
            if( regList === undefined )
            {
                if( uri.length !== URIs.defragmented(uri).length )
                {
                    throw MALFORMED_PARAMETER + ': Fragmented (#) document location: ' + uri;
                }

                if( URIs.isDetectedAbnormal( uri )) throw URIs.makeMessage_abnormal( uri );

                if( uri === DOCUMENT_URI ) throw MALFORMED_PARAMETER + ': Not a separate document';

                regList = [];
                jointRegistry.set( uri, regList );
            }
            return regList;
        }



        function setSubjointPreview( jointer, newPreviewString )
        {
            const bJ = asElementNamed( 'bitformJointing', jointer.lastChild );
            const preview = asElementNamed( 'preview', bJ.firstChild/*a*/.firstChild );
            const previewText = preview.firstChild;
            previewText.replaceData( 0, previewText.length, newPreviewString );
            configureForSubjointPreview( jointer, preview, newPreviewString );
        }



        /** Finishes the presentation of bitform joints on the surjoint side.
          */
        function start1_presentDocument( jointRegistry )
        {
            for( const entry of jointRegistry )
            {
                const jRegList = entry[1];
                if( jRegList.length === 0 ) continue; // No bitform joints into this document

                const sbjDocUri = entry[0];
                DocumentCache.readNowOrLater( sbjDocUri, new class extends DocumentReader
                {
                    close( cacheEntry )
                    {
                        if( cacheEntry.document !== null ) return;

                        for( const r of jRegList ) setSubjointPreview( r.jointer, MYSTERY_SYMBOL );
                    }

                    read( cacheEntry, sbjDoc )
                    {
                        for( const jReg of jRegList )
                        {
                            const id = jReg.subjointId;
                            const sbj = sbjDoc.getElementById( id );
                            const jointer = jReg.jointer;
                            const joinV = jointer.getAttributeNS( NS_WAY, 'join' ); /* Nominal form
                              as declared of normal form <sbjDocUri>#<id>.  Used for reporting only. */

                          // ===============
                          // Report and mark as broken any invalid jointer
                          // ===============
                            const isReported = ( ()=>
                            {
                                if( sbj === null ) // Jointer yields an incomplete joint?
                                {
                                    tsk( makeMessage_incompleteJointTo('that document',joinV) );
                                    return true;
                                }

                                return isReportedAsDoubleJointing( joinV, sbj ); // Or a double joint?
                            })();

                            if( isReported )
                            {
                                setSubjointPreview( jointer, BREAK_SYMBOL );
                                jointer.setAttributeNS( NS_READ, 'isBroken', 'isBroken' );
                                continue;
                            }

                          // =======================
                          // Finish the presentation
                          // =======================
                            const previewString = makeSubjointPreviewString( sbj, id, sbjDocUri,
                              LeaderReader );
                            const jN = jointer.localName;
                            const jNResolved = jN === ELEMENT_NAME_UNCHANGED? sbj.localName: jN;
                            const jNS = jointer.namespaceURI;
                            const image = new SubjointImage( jNResolved, jNS, previewString );
                            if( image.equals( /*imageWas*/jReg.subjointImage ))
                            {
                              // Affirm the presentation as is
                              // -----------------------
                                jointer.removeAttributeNS( NS_READ, 'imaging' );
                                continue;
                            }

                          // Amend the presentation, as it presents an outdated image
                          // ----------------------
                            const part2 = new PartTransformC2( jointer );
                            configureForSubjoint( jNS, jN, joinV, sbj, part2 );
                            part2.run();
                            setSubjointPreview( jointer, previewString );

                          // Update the image cache
                          // ----------------------
                            SubjointImageCache.write( sbjDocUri + '#' + id, image );
                        }
                    }
                });
            }
        }



        /** Pre-caches for each subjoining way declaration document the subjoint images *it* would need
          * if it were loaded in turn, e.g. by travel to it across a joint from the present document.
          */
        function start2_subjoiningDocuments( jointRegistry )
        {
            // Now call each subjoint document *surjoint*, and image *its* subjoining waybits:
            for( const srjDocUri of jointRegistry.keys() )
            {
                DocumentCache.readNowOrLater( srjDocUri, new class extends DocumentReader
                {
                    read( _cacheEntry/*ignored*/, srjDoc )
                    {
                        const traversal = srjDoc.createNodeIterator( srjDoc, SHOW_ELEMENT );
                        for( traversal.nextNode()/*onto the document node itself*/;; )
                        {
                            const jointer = traversal.nextNode();
                            if( jointer === null ) break;

                            const joinV = jointer.getAttributeNS( NS_WAY, 'join' );
                            if( joinV === null ) continue; // Needs no image, is not an actual jointer

                            const jNS = jointer.namespaceURI;
                            if( !isBitNS( jNS )) continue; // Needs no image, is not bitform

                            let sbjRef;
                            try { sbjRef = new SubjoiningWaybitReference( srjDocUri, jointer, joinV ); }
                            catch( unparseable ) { continue; }

                            // No need here to fend against other types of malformed reference;
                            // no harm in caching a superfluous image.
                            let sbjDocPath = sbjRef.subjointDocumentPath;
                            if( sbjDocPath.length === 0 ) continue;
                              // Needs no caching, intradocument joint

                            sbjDocPath = URIs.normalized( sbjDocPath, /*base*/srjDocUri );
                            if( sbjDocPath === srjDocUri ) continue;
                              // Needs no caching, intradocument joint

                            DocumentCache.readNowOrLater( sbjDocPath, new class extends DocumentReader
                            {
                                read( _cacheEntry/*ignored*/, sbjDoc )
                                {
                                    const id = sbjRef.subjointId;
                                    const sbj = sbjDoc.getElementById( id );
                                    if( sbj === null || sbj.hasAttributeNS(NS_WAY,'join') ) return;
                                      // Invalid joint, incomplete or double

                                  // Pre-cache the image, or re-cache it  † [SIC]
                                  // -------------------
                                    const previewString = makeSubjointPreviewString( sbj, id, sbjDocPath,
                                      LeaderReader );
                                    SubjointImageCache.write( sbjDocPath + '#' + id,
                                      new SubjointImage( jointer.localName, jNS, previewString ));
                                    // † Any re-caching here is only a side effect, not needed
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
   //   T a r g e t   W h e r e a b o u t s


    /** The apparent direction of travel (from the present document) to a hyperlink target
      * for the purpose of user orientation.
      */
    class TargetWhereabouts
    {


        /** Constructs a TargetWhereabouts.
          *
          *     @param direction (string, see #direction)
          *     @param documentUri (string, see #documentUri)
          *     @param element (Element, see #element)
          */
        constructor( direction, documentUri, element )
        {
            this._direction = direction;
            this._documentUri = documentUri;
            this._element = element;
        }



        /** The relative direction to the target element if it exists in the present document.
          *
          *     @return (string) Null if the target element is null;
          *       otherwise one of TARGET_SELF, TARGET_UP or TARGET_DOWN.
          *     @see #element
          */
        get direction() { return this._direction; }



        /** The nominal location of the target document as a URI (string) in normal form,
          * or the empty string if the target element is nominally in the present document.
          *
          *     @see URIs#normalized
          */
        get documentUri() { return this._documentUri; }



        /** The target element within the present document, or null if there is none.
          * This property is null in the case of an extradocument or incomplete hyperlink.
          */
        get element() { return this._element; }



        /** Constructs a TargetWhereabouts from a referential jointer.
          *
          *     @param jointer (Element) A referential jointer located in the present document.
          *     @param sbjRef (SubjoiningWaybitReference) The subjoining waybit reference
          *       as parsed from the jointer.
          */
        static fromJointer( jointer, sbjRef )
        {
            if( jointer.ownerDocument !== document ) throw MALFORMED_PARAMETER;

            const docPath = sbjRef.subjointDocumentPath;
            if( docPath.length > 0 )
            {
                const docUri = URIs.normalized( docPath, /*base*/DOCUMENT_URI );
                if( docUri !== DOCUMENT_URI ) // Then the target is outside the present document
                {
                    return new TargetWhereabouts( /*direction*/null, docUri, /*element*/null );
                }
            }

            // The target element is nominally within the present document
            const element = document.getElementById( sbjRef.subjointId );
            if( element !== null )
            {
                return fromJoint( jointer, element );

                /** Constructs a TargetWhereabouts from a jointer and subjoining waybit,
                  * both located in the present document.
                  *
                  *     @param jointer (Element) The jointer.
                  *     @param sbj (Element) The subjoining waybit.
                  */
                function fromJoint( jointer, sbj )
                {
                 // if( jointer.ownerDocument !== document )
                 //      || sbj.ownerDocument !== document ) throw MALFORMED_PARAMETER;
                 /// Already adequately guarded above

                    const direction = ( ()=>
                    {
                        if( jointer === sbj ) return TARGET_SELF;

                        const targetPosition = jointer.compareDocumentPosition( sbj );
                        if( targetPosition & DOCUMENT_POSITION_PRECEDING ) return TARGET_UP;

                        console.assert( targetPosition & DOCUMENT_POSITION_FOLLOWING, A );
                        return TARGET_DOWN;
                    })();
                    return new TargetWhereabouts( direction, /*documentUri*/'', sbj );
                }
            }

            tsk( makeMessage_incompleteJointTo('this document',sbjRef.joinV) );
            return new TargetWhereabouts( /*direction*/null, /*documentUri*/'', element );
        }


    }



   // ==================================================================================================
   //   V i e w p o r t i n g


    /** Dealing with the viewport and its scroller.
      */
    const Viewporting = ( function()
    {

        const expo = {}; // The public interface of Viewporting



        /** Ensures that the window targeted element, if any, will be visible within the viewport.
          *
          *     @see Hyperlinkage#windowTargetedElement
          */
        expo.ensureTargetWillShow = function() // [WTP]
        {
            const e = Hyperlinkage.windowTargetedElement();
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


    /** A device for tracing the way across multiple, referentially joined documents.  It traces into
      * the way root element, through its joints and onward till it traces the way declaration in full.
      * The trace serves two ultimate purposes: (1) reforming the present document to show which parts
      * are *on way*; and (2) discovery of other documents for cache omnireaders.
      *
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
            DocumentCache.readNowOrLater( ROOT_DOCUMENT_URI, new class extends DocumentReader
            {
                close( cacheEntry ) { shutLeg( id ); }
                read( cacheEntry, doc )
                {
                    const root = doc.getElementById( 'root', doc );
                    if( root !== null ) traceLeg( id, root, cacheEntry );
                    else tsk( 'Unable to trace: Missing way root element: ' + id );
                }
            });
        };



       // - P r i v a t e ------------------------------------------------------------------------------


        /** Answers whether the specified leg is already traced.
          *
          *     @param legId (string, see #makeLegId)
          *
          *     @see #shutLeg
          */
        function isShut( legId ) { return legsShut.includes(legId); }
          // The likely efficiency of this test is asserted by INC FAST, q.v.



        /** Array of leg identifiers (string), one for each leg of the trace in progress.
          */
        const legsOpen = [];



        /** Array of leg identifiers (string), one for each leg that is done tracing.
          */
        const legsShut = [];



        /** Constructs a trace leg identifier (string) for the given subjoining waybit.
          * Each trace leg is scoped to single DOM branch exclusive of subjoints.
          *
          *     @param sbjDocUri (string) The location of the subjoint document in normal URI form.
          *     @param sbjId (string) The identifier of the subjoining waybit.
          *
          *     @see URIs#normalized
          */
        function makeLegId( sbjDocUri, sbjId ) { return sbjDocUri + '#' + sbjId; }



        /** Adds the given leg identifier to legsOpen.
          *
          *     @param legId (string, see #makeLegId)
          *
          *     @see #wasOpened
          */
        function openLeg( legId )
        {
            legsOpen.push( legId );
         // console.debug( legsOpen.length + '\t\tleg ' + legId ); // TEST
              // Spacing matters here, cf. shutLeg
        }



        /** The identifier of the root leg of the trace, from which all other legs are traced.
          *
          *     @see http://reluk.ca/project/wayic/script/way_root_element
          */
        const ROOT_LEG_ID = makeLegId( ROOT_DOCUMENT_URI, 'root' );



        /** Moves the given leg identifier from legsOpen to legsShut,
          * then starts decorating if all legs are now shut.
          *
          *     @param legId (string, see #makeLegId)
          *
          *     @throws (string) Error message if legId is missing from legsOpen.
          *
          *     @see #isShut
          */
        function shutLeg( legId )
        {
            const o = legsOpen.indexOf( legId );
            if( o < 0 ) throw 'Leg is not open: ' + legId;

          // Shut the leg
          // ------------
            legsOpen.splice( o, /*removal count*/1 );
         // console.debug( '\t' + legsOpen.length + '\tleg ' + legId + ' ·' ); // TEST
              // Spacing matters here, cf. openLeg
            legsShut.push( legId );
            if( legsOpen.length > 0 ) return;

          // After all are shut
          // ------------------
            console.assert( legsShut.length < 200, AA + 'INC FAST, q.v.' );
              // Asserting the likely efficiency of the tests legsOpen and legsShut.includes
         // console.debug( 'Trace run complete' ); // TEST
        }



        /** Ensures that the specified leg is fully traced before returning.
          * May return with any number of its referentially joined legs yet untraced,
          * each slated for a separate tracing.
          *
          *     @param legId (string, see #makeLegId)
          *     @param branch (Element) Base element of the branch that comprises the leg.
          *     @param cacheEntry (DocumentCacheEntry)
          */
        function traceLeg( legId, branch, cacheEntry )
        {
            const docUri = cacheEntry.uri;
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
              // Jointer, case of
              // -------
                const joinV = t.getAttributeNS( NS_WAY, 'join' );
                jointer: if( joinV !== null )
                {
                    let sbjRef;
                    try
                    {
                        sbjRef = new SubjoiningWaybitReference( /*srjDocUri*/docUri, /*jointer*/t,
                          joinV );
                    }
                    catch( unparseable ) { break jointer; }

                    // No need here to fend against other types of malformed jointing.
                    // Rather take it as the wayscribe intended, and so extend the trace.
                    let sbjDocPath = sbjRef.subjointDocumentPath;
                    sbjDocPath = sbjDocPath.length > 0?
                      URIs.normalized(sbjDocPath,/*base*/docUri): docUri;
                    const sbjId = sbjRef.subjointId;
                    const sbjLegId = makeLegId( sbjDocPath, sbjId );
                    if( wasOpened( sbjLegId )) break jointer;

                    openLeg( sbjLegId );
                    DocumentCache.readNowOrLater( sbjDocPath, new class extends DocumentReader
                    {
                        close( sbjDocReg )
                        {
                            if( sbjDocReg.document === null ) shutLeg( sbjLegId );
                            // Else readDirectly has (or will) shut it
                        }

                        read( sbjDocReg, sbjDoc ) /* The call to this method might come now or later,
                          but the method itself ensures that any actual reading is done only later,
                          after the present leg is fully traced and marked shut.  Thus it enables
                          optimizations elsewhere in the code that depend on such ordering. */
                        {
                            const wasCalledLate = isShut( legId );
                            const readMethod = wasCalledLate? this.readDirectly: this.readLater;
                            readMethod.call( this, sbjDocReg, sbjDoc );
                        }

                        readDirectly( sbjDocReg, sbjDoc )
                        {
                            const sbj = sbjDoc.getElementById( sbjId );
                            sbjTrace:
                            {
                                if( sbj === null )
                                {
                                    console.info( 'Incomplete joint truncates trace at leg: '
                                      + sbjLegId ); // In case a report issues from nowhere else
                                    break sbjTrace; // Invalid joint
                                }

                                if( sbj.hasAttributeNS( NS_WAY, 'join' )) break sbjTrace; /* Invalid
                                  (double) joint.  Always a report issues from elsewhere in the code. */

                              // Shield the subjoint trace work with a scan of ancestors
                              // ------------------------------
                                for( let a = sbj;; )
                                {
                                    a = a.parentNode;
                                    const aNS = a.namespaceURI;
                                    if( aNS === null ) // Then *a* is the document node
                                    {
                                        tsk( 'Malformed document: Missing *body* element: ' + sbjDocPath );
                                        break; // In case of jointing to a non-HTML document
                                    }

                                    if( isBitNS( aNS ))
                                    {
                                        const id = a.getAttribute( 'id' );
                                        if( id === null ) continue;

                                        if( isShut( makeLegId( sbjDocPath, id ))) break sbjTrace;
                                          // If only for sake of efficiency, ∵ this subjoint branch is
                                          // covered already (or will be) as part of a larger branch.
                                    }
                                    else if( a.localName === 'body' && aNS === NS_HTML ) break;
                                }

                              // Trace into the subjoint
                              // -----------------------
                                traceLeg( sbjLegId, sbj, sbjDocReg );
                            }
                            shutLeg( sbjLegId );
                        }

                        readLater( sbjDocReg, sbjDoc )
                        {
                         // setTimeout( this.readDirectly, /*delay*/0, sbjDocReg, sbjDoc );
                         /// But more efficiently (as a microtask) and properly bound as a method call:
                            Promise.resolve().then( (()=>
                            {
                                this.readDirectly( sbjDocReg, sbjDoc );
                            }).bind( this ));
                            // This merely postpones execution till (I think) the end of the current
                            // event loop.  A more elegant and useful solution might be to specifically
                            // await the shut state of the present leg.  Maybe that too could be done
                            // using this new Promise/async facility?
                        }
                    });
                }

              // Subjoining waybit, case of
              // -----------------
                const id = t.getAttribute( 'id' );
                if( id && isShut(makeLegId(docUri,id)) ) toLastDescendant( traversal ); /* Bypassing
                  sub-branch t, if only for efficiency, as already it was traced in a separate leg. */
            }
            while( (t = traversal.nextNode()) !== null );
        }



        /** Answers whether the specified leg was ever opened.
          *
          *     @param legId (string, see #makeLegId)
          *
          *     @see #openLeg
          */
        function wasOpened( legId ) { return legsOpen.includes(legId) || legsShut.includes(legId); }
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
  *  [FSS]  Session storage for a document requested from a ‘file’ scheme URI.  On moving from document
  *         D1 to new document D2 by typing in the address bar (not activating a link), an item stored
  *         by D2 may, after travelling back, be unreadable by D1, as though it had not been stored.
  *         Affects Firefox 52.6.  Does not affect Chrome under option ‘--allow-file-access-from-files’.
  *
  *  [NPR]  Network-path reference.  https://tools.ietf.org/html/rfc3986#section-4.2
  *
  *  [ODO]  Out of display order.  This sometime present element is declared out of
  *         display order so not to interfere with the ordering of its ever present siblings.
  *         Normally it would be declared earlier, but that would complicate the lookup of its siblings,
  *         making them harder to find.
  *
  *  [OUR]  Here the entry reference is restricted to *our* entries in the session history.
  *         An entry’s document might not run this program, or its session store might be inaccessible
  *         to this program.  Such an entry would not be *ours* in the present sense of the term.
  *
  *  [PD] · Path data.  It could instead be defined using the new SVGPathData interface, but this
  *         (array-form instead of string-form definition) wouldn’t help enough to outweigh the bother
  *         of using a polyfill.  https://github.com/jarek-foksa/path-data-polyfill.js
  *
  *  [PSA]  Page-show animation.  On revisiting a loaded page in session history (forward or backward),
  *         sometimes Firefox (60) fails to start or restart an animation commanded by a style rule.
  *
  *  [QN] · Qualified name.  https://www.w3.org/TR/xml-names/#ns-qualnames
  *
  *  [RPP]  Restricted public property.  Despite its exposure in the public interface,
  *         this property is not intended for general use.
  *
  *  [S]  · http://reluk.ca/project/wayic/script/doc.task
  *
  *  [SH] · Standard HTML.  Here deliberately using standard HTML for sake of its proper DOM features,
  *         such as the *style* attribute.
  *
  *  [SIC]  SubjointImageCache.  The purpose of caching the subjoint images is to stablize the view
  *         within the viewport, especially on the vertical axis.  The vertical layout of the view
  *         depends on subjoint imaging.  If an image for an extradocument joint loads asynchronously,
  *         then it may deflect the view vertically.  Image caching and pre-caching will prevent this,
  *         stabilizing the view in all but a few edge cases.
  *
  *  [SVS]  Surrogate of viewport size.  Here using the size of the viewport including its scrollbar
  *         (if any) as a rough surrogate for the viewport size alone, which is harder to obtain.
  *
  *  [UAU]  Here employing the URL API to handle URIs in general.  Despite the name "URL API",
  *         it actually covers the forms "URI and IRI" to boot.  https://url.spec.whatwg.org/#goals.
  *
  *  [UN] · Either *undefined* or null in value.
  *
  *  [UZ] · Either *undefined* or zero in value.
  *
  *  [WDL]  ‘window.location’ or ‘window.document.location’?  One may use either, they are identical.
  *         https://www.w3.org/TR/html5/browsers.html#the-location-interface
  *
  *  [WTP]  Window target positioning.  Normally the browser itself does this, vertically scrolling
  *         the view to ensure the target appears in the viewport.  Firefox 60 was seen to fail however.
  *         It failed when this program was loaded by a *script* element injected at runtime.
  *         Probably because then the program ran late and was therefore late in styling the elements
  *         - especially the crucial display style of ‘block’ for the proper Wayscript elements,
  *         which are XML and therefore ‘inline’ by default - which confused the browser.
  *
  *         A remedy might be to make this program load immediately.  The only reliable way, however,
  *         is to have the wayscribe write the *script* element into every way declaration document,
  *         which would be too awkward.  To instead write the *script* element programatically
  *         is disallowed for XML documents, and ‘strongly discouraged’ as unreliable for non-XML.
  *         http://w3c.github.io/html/webappapis.html#documentwrite
  *
  *         That leaves only *eval* or *Function*.  https://stackoverflow.com/a/21730944/2402790
  *         Neither seems reliable, especially in the case of debugging.
  */


// Copyright © 2017-2019 Michael Allan and contributors.  Licence MIT.
