// myApp/widget/checkboxTree.js
define([
	"dojo/_base/declare",
	'dojo/_base/lang',
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin",

	'dojo/dom-construct',
	'dojo/query',
	'dojo/on',
	'dojo/dom-class',
	'dojo/dom-attr',
	'dojo/_base/array',

	'xstyle!./css/checkboxTree.css'
], function(
	declare, 
	lang,
	_WidgetBase,
	_TemplatedMixin,

	domConstruct,
	dojoQuery,
	on,
	domClass,
	domAttr,
	array
){
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: '<div><ul class="checkboxTreeRoot" data-dojo-attach-point="checkboxTreeRoot" style="list-style-type:none"></ul></div>',

		baseClass : "checkboxTreeWidget",
		
		hierarchy : {
			name: "root",
			children: {},
			domNode: null,
			level: 0,
			hasChildren: false,
			isCollapsible: false
		},

		constructor: function (domNode) {
			this.domNode = domNode;
			this.hierarchy.domNode = domNode;
		},

		addItem: function (itemLabel, parent) {
			// Create item in dom
			parent = parent || this.hierarchy;
			var level = parent.level + 1;
			var li = this._createListItemWithLabel(itemLabel, level);

			// add item and dom to hierarchy
			return this._addNodeToHierarchy(itemLabel, li, parent);
		},

		_createListItemWithLabel: function(itemLabel, level){
			var li = domConstruct.create("li");
			var check = domConstruct.create("input", {
			  type: "checkbox",
			  name: itemLabel,
			  value: itemLabel,
			  checked: false,
			  id: level+itemLabel
			}, li, "first");
			var label = domConstruct.create("label", {
			  for: level+itemLabel,
			  innerHTML: itemLabel
			}, li, "last");			
			return li;
		},

		_makeLiCollapsible: function (li, level) {
			var arrow = domConstruct.create("span", {class: "icon-arrow-closed icon-arrow"}, li, "first");
			on(arrow, "click", this._handleCollapsibleListClick);

			// add ul under li to start child list
			domConstruct.create("ul", {style: {"list-style-type": "none"}, class : "collapsible-list-"+level, hidden: ""}, li, "last");
		},

		_checkOnChange: function (node, event) {
			if(node.hasChildren){
				var value = event.srcElement.checked;
				for(var childName in node.children){
					var childNode = node.children[childName];
					var check = dojoQuery("input:[type=checkbox]", childNode.domNode)[0];
					check.checked = value;
					this._checkOnChange(childNode, null);
				}
			}
		},

		_addNodeToHierarchy: function (name, domNode, parent) {
			var level = parent.level + 1;
			var node = {
				name: name,
				domNode: domNode,
				level: level,
				children: {},
				hasChildren: false,
				isCollapsible: false
			};
			if(level == 1){
				this._makeLiCollapsible(domNode, level+1);
				node.isCollapsible = true;
			}
			if( !parent.isCollapsible && parent.level > 0 ){
				this._makeLiCollapsible(parent.domNode, level);
				parent.isCollapsible = true;
			}
			parent.children[name] = node;
			parent.hasChildren = true;

			// add new node to parent dom
			var check = dojoQuery("input:[type=checkbox]", domNode);
			on(check, 'change', lang.hitch(this, this._checkOnChange, node)); 
			var ul = dojoQuery("ul", parent.domNode)[0];
			domConstruct.place(domNode, ul, "last");
			return node;
		},

		_handleCollapsibleListClick: function (event) {
			if(domClass.contains(event.target, "icon-arrow-open")){
				addClass = "icon-arrow-closed";
				removeClass = "icon-arrow-open";
				domAttr.set(dojoQuery("ul.collapsible-list-2", event.target.parentElement)[0], "hidden", "");
			}
			else{
				addClass = "icon-arrow-open";
				removeClass = "icon-arrow-closed";
				domAttr.remove(dojoQuery("ul.collapsible-list-2", event.target.parentElement)[0], "hidden");
			}
			domClass.remove(event.target, removeClass);
			domClass.add(event.target, addClass);
		},

		getAllCheckedValues: function (parentNode) {
			// console.log(this.hierarchy);
			var parent = parentNode || this.hierarchy;
			// console.log(parent);

			var children = {};
			if(parent.hasChildren){
				for(var name in parent.children){
					var check = dojoQuery("input:[type=checkbox]", parent.children[name].domNode)[0];
					if(check.checked){
						children[name] = this.getAllCheckedValues(parent.children[name]);
					}
				}
			}
			return children;
		}
	});
});