!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.ezPluginEmbed=t():(e.eZ=e.eZ||{},e.eZ.ezAlloyEditor=e.eZ.ezAlloyEditor||{},e.eZ.ezAlloyEditor.ezPluginEmbed=t())}("undefined"!=typeof self?self:this,function(){return function(e){function t(i){if(n[i])return n[i].exports;var o=n[i]={i:i,l:!1,exports:{}};return e[i].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var n={};return t.m=e,t.c=n,t.d=function(e,n,i){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:i})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=58)}({58:function(e,t,n){"use strict";!function(e){CKEDITOR.plugins.get("ezembed")||CKEDITOR.plugins.add("ezembed",{requires:"widget,ezaddcontent",init:function(e){e.ezembed={canBeAdded:function(){var t=e.elementPath();return!t||null===t.contains("table",!0)}},e.widgets.add("ezembed",{defaults:{href:"ezcontent://",content:"home",view:"embed"},draggable:!1,template:'<div data-ezelement="ezembed" data-href="{href}" data-ezview="{view}">{content}</div>',requiredContent:"div",upcast:function(e){return"div"===e.name&&"ezembed"===e.attributes["data-ezelement"]},insert:function(){var t,n=CKEDITOR.dom.element.createFromHtml(this.template.output(this.defaults)),i=e.widgets.wrapElement(n,this.name),o=new CKEDITOR.dom.documentFragment(i.getDocument());o.append(i),e.widgets.initOn(n,this.name),e.eZ.appendElement(i),t=e.widgets.getByElement(i),t.ready=!0,t.fire("ready"),t.focus()},edit:function(){this.insert()},init:function(){this.on("focus",this.fireEditorInteraction),this.syncAlignment(),this.getEzConfigElement(),this.setWidgetContent(""),this.cancelEditEvents(),this.initEditMode()},initEditMode:function(){var e=this.getHref().replace("ezcontent://","");e&&this.loadContent(e)},loadContent:function(e){var t=document.querySelector('meta[name="CSRF-Token"]').content,n=document.querySelector('meta[name="SiteAccess"]').content,i=JSON.stringify({ViewInput:{identifier:"embed-load-content-info-"+e,public:!1,ContentQuery:{Criteria:{},FacetBuilders:{},SortClauses:{},Filter:{ContentIdCriterion:""+e},limit:1,offset:0}}}),o=new Request("/api/ezp/v2/views",{method:"POST",headers:{Accept:"application/vnd.ez.api.View+json; version=1.1","Content-Type":"application/vnd.ez.api.ViewInput+json; version=1.1","X-Siteaccess":n,"X-CSRF-Token":t},body:i,mode:"cors",credentials:"same-origin"});fetch(o).then(function(e){return e.json()}).then(this.handleContentLoaded.bind(this)).catch(function(e){return console.log("error:load:content:info",e)})},loadImageVariation:function(e){var t=this,n=document.querySelector('meta[name="CSRF-Token"]').content,i=document.querySelector('meta[name="SiteAccess"]').content,o=new Request(e,{method:"GET",headers:{Accept:"application/vnd.ez.api.ContentImageVariation+json","X-Siteaccess":i,"X-CSRF-Token":n},credentials:"same-origin",mode:"cors"});fetch(o).then(function(e){return e.json()}).then(function(e){return t.renderEmbedImagePreview(e.ContentImageVariation.uri)})},handleContentLoaded:function(e){var t=this.element.$.classList.contains("ez-embed-type-image"),n=e.View.Result.searchHits.searchHit[0].value.Content;if(t){var i=n.CurrentVersion.Version.Fields.field.find(function(e){return"ezimage"===e.fieldTypeIdentifier}),o=this.getConfig("size"),r=i.fieldValue.variations[o].href;this.variations=i.fieldValue.variations,this.loadImageVariation(r)}else this.renderEmbedPreview(n.Name)},loadImagePreviewFromCurrentVersion:function(e){var t=this,n=document.querySelector('meta[name="CSRF-Token"]').content,i=document.querySelector('meta[name="SiteAccess"]').content,o=new Request(e,{method:"GET",headers:{Accept:"application/vnd.ez.api.Version+json","X-Siteaccess":i,"X-CSRF-Token":n},credentials:"same-origin",mode:"cors"});fetch(o).then(function(e){return e.json()}).then(function(e){var n=e.Version.Fields.field.find(function(e){return"ezimage"===e.fieldTypeIdentifier}),i=t.getConfig("size"),o=n.fieldValue.variations[i].href;t.variations=n.fieldValue.variations,t.loadImageVariation(o)})},renderEmbedPreview:function(e){var t=document.createElement("p"),n='\n                        <svg class="ez-icon">\n                            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/bundles/ezplatformadminui/img/ez-icons.svg#tag"></use>\n                        </svg>\n                        <span class="ez-embed-content__title">'+e+"</span>\n                    ";t.classList.add("ez-embed-content"),t.innerHTML=n,this.setWidgetContent(t)},renderEmbedImagePreview:function(e){var t=document.createElement("img");t.setAttribute("src",e),this.setWidgetContent(t)},cancelEditEvents:function(){var e=function(e){return e.cancel()};this.on("doubleclick",e,null,null,5),this.on("key",e,null,null,5)},syncAlignment:function(){var e=this.element.data("ezalign");e?this._setAlignment(e):this._unsetAlignment()},_setAlignment:function(e){this.wrapper.data("ezalign",e),this.element.data("ezalign",e)},setAlignment:function(e,t){this._setAlignment(e),this.fireEditorInteraction("setAlignment"+e)},_unsetAlignment:function(){this.wrapper.data("ezalign",!1),this.element.data("ezalign",!1)},unsetAlignment:function(){this._unsetAlignment(),this.fireEditorInteraction("unsetAlignment")},isAligned:function(e){return this.wrapper.data("ezalign")===e},setImageType:function(){return this.element.addClass("ez-embed-type-image"),this},isImage:function(){return this.element.hasClass("ez-embed-type-image")},setHref:function(e){return this.element.data("href",e),this},getHref:function(){return this.element.data("href")},setWidgetContent:function(e){for(var t=this.element.getFirst(),n=void 0;t;)n=t.getNext(),t.data&&t.data("ezelement")||t.remove(),t=n;return e instanceof CKEDITOR.dom.node?this.element.append(e):this.element.appendText(e),this},moveAfter:function(e){this.wrapper.insertAfter(e),this.fireEditorInteraction("moveAfter")},moveBefore:function(e){this.wrapper.insertBefore(e),this.fireEditorInteraction("moveBefore")},setConfig:function(e,t){var n=this.getValueElement(e);return n||(n=new CKEDITOR.dom.element("span"),n.data("ezelement","ezvalue"),n.data("ezvalue-key",e),this.getEzConfigElement().append(n)),n.setText(t),this},getConfig:function(e){var t=this.getValueElement(e);return t?t.getText():void 0},getValueElement:function(e){return this.element.findOne('[data-ezelement="ezvalue"][data-ezvalue-key="'+e+'"]')},getEzConfigElement:function(){var e=this.element.findOne('[data-ezelement="ezconfig"]');return e||(e=new CKEDITOR.dom.element("span"),e.data("ezelement","ezconfig"),this.element.append(e,!0)),e},fireEditorInteraction:function(t){var n=this.getWrapperRegion(),i=t.name||t,o={editor:e,target:this.element.$,name:"widget"+i,pageX:n.left,pageY:n.top+n.height};e.focus(),this.focus(),e.fire("editorInteraction",{nativeEvent:o,selectionData:{element:this.element,region:n}})},getWrapperRegion:function(){var e=this.wrapper.getWindow().getScrollPosition(),t=this.wrapper.getClientRect();return t.top+=e.y,t.bottom+=e.y,t.left+=e.x,t.right+=e.x,t.direction=CKEDITOR.SELECTION_TOP_TO_BOTTOM,t}})}})}(window)}}).default});
//# sourceMappingURL=ezPluginEmbed.js.map