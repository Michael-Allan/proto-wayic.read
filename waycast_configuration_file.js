/** waycast_configuration_file.js - Presentation program for the waycast configuration file
  *                                `waycast.xml`
  *
  *   Summoned into the waycast configuration file by the transformer `waycast_configuration_file.xslt`,
  *   this program runs on the client side — in the waycast reader’s Web browser — where it manipulates
  *   the DOM of the waycast configuration.
  */
'use strict';
console.assert( (eval('var _tmp = null'), typeof _tmp === 'undefined'),
  'Failed assertion: Strict mode is in effect' );
  // http://www.ecma-international.org/ecma-262/6.0/#sec-strict-mode-code
  // Credit Noseratio, https://stackoverflow.com/a/18916788/2402790
( function()
{

    const CSide = ca_reluk_web_CSide; // Imports from the general Web library

        const DOCUMENT_URI = CSide.DOCUMENT_URI;



    /** Runs this program.
      */
    function run()
    {
      // 1. Read the waycast configuration file
      // --------------------------------------
 //     const requestor = makeDocumentRequestor( DOCUMENT_URI ) // FIX to 'file' requestor
    }



////////////////////

    run();

}() );


// Copyright © 2019 Michael Allan and contributors.  Licence MIT.
