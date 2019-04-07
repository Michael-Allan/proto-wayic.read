<?xml version='1.0' encoding='UTF-8'?>
<!-- - -
 ! waycast_configuration_file.xslt - Presentation transformer for the waycast configuration file
 !                                  `waycast.xml`
 !
 !   Summoned by an `xml-stylesheet` processing instruction in the waycast configuration file
 !   `waycast.xml`, this transformer runs on the client side — in the waycast reader’s Web browser
 !   — where it initializes the presentation of the waycast configuration, roughing out
 !   its form and therefrom summoning sibling files `./waycast_configuration_file.css`,
 !   `./waycast_configuration_file.js` and other resources to finalize it.
 !
 !   See `./manual.task` for usage and other instructions.
 -->
<stylesheet version='1.0' xmlns='http://www.w3.org/1999/XSL/Transform'> <!-- Re `version`, "XSLT 2.0 is
  not natively supported in Firefox," https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XSLT_2.0 -->

    <variable name='reluk-dir'>http://reluk.ca/project</variable> <!-- Without a trailing slash -->
<!--<variable name='reluk-dir'>/LOCAL/WORKING/COPY</variable> --> <!-- For TEST purposes only -->

    <output method='xml' version='1.0' encoding='UTF-8' media-type='application/xhtml+xml'/>
    <template match='/'>
        <variable name='static-base-ref'
         select="substring-before(substring(substring-after(processing-instruction('xml-stylesheet')[1], ' href='),2),'/waycast_configuration_file.xslt')"/>
          <!-- URI reference of this file's parent directory without a trailing slash.  Got, in lieu
            of XPath 2 function `static-base-uri`, from the source file's reference to this file. -->
        <html:html xmlns:html='http://www.w3.org/1999/xhtml' xml:lang='en-CA'>
            <html:head>
                <html:link rel='stylesheet' href='{$static-base-ref}/waycast_configuration_file.css'/>
                </html:head>
            <html:body>
                <html:script src='{$reluk-dir}/web/client_side.js'/>
                <html:script src='{$static-base-ref}/waycast_configuration_file.js'/>
                </html:body>
            </html:html>
        </template>

    </stylesheet>


<!-- Copyright © 2019 Michael Allan and contributors.  Licence MIT. -->
