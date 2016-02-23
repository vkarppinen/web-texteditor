/**********************************
 *
 * Javascript wysiwyg editor.
 * © Valtteri Karppinen, 22.2.2016
 *
 **********************************/

var editor = {
	
	/*
	 * Editor container 
	 */
	container: null,

	/*
	 * Editor tools
	 * 		exampleTool: {
	 *			elem: specifies the button element for toggling the tool (null before editor initialization),
	 *			name: name of the tool,
	 *			toolType: type of the tool,
	 *			content: speciefiec content shown inside the button element.
	 * 			style: accepts css styling for the toolbutton (i.e. "font-weight: bold;)
	 *			state: active/inaction (null before editor initialization),
	 *			action: function for tool action on toolbutton click,
	 *			etc... (a tool can have alternate options)
	 *		}
	 */
	tools: {
		
		editViewToggle: {
			elem: null,
			name: "editViewToggle",
			tooltip: "Toggle the content area between editable and viewable states.",
			toolType: "general",
			content: "Edit",
			style: 	"font-weight: bold;" +
					"background-color: #99cc33;",
			state: "active",

			action: function () {

				// Disable all other tools if disabling edit mode.
				for (var t in editor.tools) {
					t = editor.tools[t];
					if (t.state == "active" && t.name != "editViewToggle") editor.toggleTool(t);
				}

				var tool = editor.tools["editViewToggle"];
				var classes = tool.elem.classList;
				if (tool.state == "active") {
					classes.remove('edit', 'active-tool');
					classes.add('view');
					tool.state = "inactive";
				}
				else {
					classes.add('edit', 'active-tool');
					classes.remove('view');
					tool.state = "active";
				}
				var editArea = document.getElementById("editor-content");
				var editable = editArea.getAttribute('contenteditable');
				if (editable=="true") editArea.setAttribute('contenteditable', false);
				else editArea.setAttribute('contenteditable', true);
			}
		},

		undo: {
			elem: null,
			name: "undo",
			tooltip: "Undo",
			toolType: "general",
			style: 	"background-image: url(images/undo.png);" +
					"background-repeat: no-repeat;" + 
					"background-position: center;",

			action: function () {
				editor.runCommand(editor.tools["undo"], false, 'undo', false, true);
			}

		},

		redo: {
			elem: null,
			name: "redo",
			tooltip: "Redo",
			toolType: "general",
			style: 	"background-image: url(images/redo.png);" +
					"background-repeat: no-repeat;" + 
					"background-position: center;",

			action: function () {
				editor.runCommand(editor.tools["redo"], false, 'redo', false, true); 
			}
		},

		fontSize: {
			elem: null,
			name: "fontSize",
			tooltip: "Apply a font size to selection.",
			toolType: "font",
			style: null,
			sizes: [8, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 60, 72],
			action: function () {

				var selection = window.getSelection();

				if (selection != "") {
					var select = document.getElementById("fontSize");
					var newFontSize = select.options[select.selectedIndex].text;
					
					editor.runCommand(editor.tools["fontSize"], false, "fontSize", false, "7");
					var fontElements = document.getElementsByTagName('font');
					for (var i = 0; i < fontElements.length; ++i) {
				        if (fontElements[i].size == "7") {
				            fontElements[i].removeAttribute("size");
				            fontElements[i].style.fontSize = newFontSize;
				        }
    				}
				}
			}
		},

		bold: {
			elem: null,
			name: "bold",
			tooltip: "Bold selection.",
			toolType: "font",
			style: 	"background-image: url(images/bold.png);" +
					"background-repeat: no-repeat;" + 
					"background-position: center;",

			action: function () {
				editor.runCommand(editor.tools["bold"], true, 'bold', false, true);
			}
		},

		italic: {
			elem: null,
			name: "italic",
			tooltip: "Italicize selection.",
			toolType: "font",
			style: 	"background-image: url(images/italic.png);" +
					"background-repeat: no-repeat;" + 
					"background-position: center;",

			action: function () {
				editor.runCommand(editor.tools["italic"], true, 'italic', false, true);
			}
		},

		underline: {
			elem: null,
			name: "underline",
			tooltip: "Underline selection.",
			toolType: "font",
			style: 	"background-image: url(images/underline.png);" +
					"background-repeat: no-repeat;" + 
					"background-position: center;",
					
			action: function () {
				editor.runCommand(editor.tools["underline"], true, 'underline', false, true);
			}
		},

		link: {
			elem: null,
			name: "hyperlink",
			tooltip: "Insert a hyperlink to selection.",
			state: "inactive",
			toolType: "font",
			style: 	"background-image: url(images/hyperlink.png);" +
					"background-repeat: no-repeat;" + 
					"background-position: center;",
					
			action: function () {
				var linkText = window.getSelection();

				switch (editor.tools["link"].state) {
					case "inactive":
						if (linkText == "") return;
						var linkURL = prompt('Enter a URL:', 'http://');
					    editor.runCommand(editor.tools["link"], true, 'insertHTML', false, '<a href="' + linkURL + '" target="_blank">' + linkText + '</a>');
						break;

					default:
						var anchor = linkText.anchorNode.parentNode;

						while (anchor.firstChild){
						    anchor.parentNode.insertBefore(anchor.firstChild, anchor);
						}
						anchor.parentNode.removeChild(anchor);
						editor.tools["link"].state = "inactive";
						editor.tools["link"].elem.classList.remove("active-tool");
						editor.tools["underline"].state = "inactive";
						editor.tools["underline"].elem.classList.remove("active-tool");

						break;
				}
			}
		},

		p: {
			elem: null,
			name: "p",
			tooltip: "Change block formatting to paragraph.",
			toolType: "text",
			content: "p",
			style: 	"font-weight: bold;",
			state: "inactive",
			action: function () {
				editor.runCommand(editor.tools["p"], true, 'formatBlock',false,'P');
			}
		},

		h1: {
			elem: null,
			name: "h1",
			tooltip: "Change block formatting to first level heading.",
			toolType: "text",
			content: "h1",
			style: "font-weight: bold;",
			state: "inactive",
			action: function () {
				editor.runCommand(editor.tools["h1"], true, 'formatBlock',false,'H1');
			}
		},

		h2: {
			elem: null,
			name: "h2",
			tooltip: "Change block formatting to second level heading.",
			toolType: "text",
			content: "h2",
			style: 	"font-weight: bold;",
			state: "inactive",
			action: function () {
				editor.runCommand(editor.tools["h2"], true, 'formatBlock',false,'H2');
			}
		},

		h3: {
			elem: null,
			name: "h3",
			tooltip: "Change block formatting to third level heading.",
			toolType: "text",
			content: "h3",
			style: 	"font-weight: bold;",
			state: "inactive",	
			action: function () {
				editor.runCommand(editor.tools["h3"], true, 'formatBlock',false,'H3');
			}
		},

		h4: {
			elem: null,
			name: "h4",
			tooltip: "Change block formatting to fourth level heading.",
			toolType: "text",
			content: "h4",
			style: "font-weight: bold;",
			state: "inactive",	
			action: function () {
				editor.runCommand(editor.tools["h4"], true, 'formatBlock',false,'H4');
			}
		},

		horizontalLine: {
			elem: null,
			name: "hr",
			tooltip: "Add a horizontal line.",
			toolType: "elements",
			content: "hr",
			style: 	"font-weight: bold;",
			state: "inactive",
			action: function () {
				editor.runCommand(editor.tools["horizontalLine"], false, 'insertHorizontalRule', false, true);
			}
		},

		insertImage: {
			elem: null,
			name:"insertImage",
			tooltip: "Insert an image.",
			toolType: "elements",
			style: 	"background-image: url(images/image.png);" +
					"background-repeat: no-repeat;" + 
					"background-position: center;",
			state: "inactive",
			action: function () {
				var image =  prompt("Provide image url:", "http://");
				if (image != null ) editor.runCommand(editor.tools["insertImage"], false, "insertImage", false, image);
			}
		},

		unorderedList: {
			elem: null,
			name: "ul",
			tooltip: "Change block formatting to an unordered list.",
			toolType: "elements",
			style: 	"background-image: url(images/unorderedlist.png);" +
					"background-repeat: no-repeat;" + 
					"background-position: center;",
			state: "inactive",	
			action: function () {
				editor.runCommand(editor.tools["unorderedList"], true, "insertUnorderedList", false, true);
			}
		},

		orderedList: {
			elem: null,
			name: "ol",
			tooltip: "Change block formatting to an ordered list.",
			toolType: "elements",
			style: 	"background-image: url(images/orderedlist.png);" +
					"background-repeat: no-repeat;" + 
					"background-position: center;",
			state: "inactive",		
			action: function () {
				editor.runCommand(editor.tools["orderedList"], true, "insertOrderedList", false, true);
			}
		},

		justifyLeft: {
			elem: null,
			name:"justifyLeft",
			tooltip: "Justifies the selected element to left.",
			toolType: "justify",
			state: null,
			style: 	"background-image: url(images/justifyleft.png);" +
					"background-repeat: no-repeat;" + 
					"background-position: center;",
					
			action: function () {
				editor.runCommand(editor.tools["justifyLeft"], true, "justifyLeft", false, true);
			}
		},

		justifyCenter: {
			elem: null,
			name:"justifyCenter",
			tooltip: "Justifies the selected element center.",
			toolType: "justify",
			state: null,
			style: 	"background-image: url(images/justifycenter.png);" +
					"background-repeat: no-repeat;" + 
					"background-position: center;",
					
			action: function () {
				editor.runCommand(editor.tools["justifyCenter"], true, "justifyCenter", false, true);
			}
		},

		justifyRight: {
			elem: null,
			name:"justifyRight",
			tooltip: "Justifies the selected element right.",
			toolType: "justify",
			state: null,
			style: 	"background-image: url(images/justifyright.png);" +
					"background-repeat: no-repeat;" + 
					"background-position: center;",
					
			action: function () {
				editor.runCommand(editor.tools["justifyRight"], true, "justifyRight", false, true);
			}
		},

		justifyFull: {
			elem: null,
			name:"justifyFull",
			tooltip: "Justifies the selected element fully container wide.",
			toolType: "justify",
			state: null,
			style: 	"background-image: url(images/justifyfull.png);" +
					"background-repeat: no-repeat;" + 
					"background-position: center;",
					
			action: function () {
				editor.runCommand(editor.tools["justifyFull"], true, "justifyFull", false, true);
			}
		}

	},

	/*
	 * Run action on tool button click.
	 * If the tool is togglable, disable all tools of same tooltype.
	 * Enable the clicked tool.
	 * Parametres:
	 *		clickedTool: 	The tool object clicked.
	 * 		isTogglable: 	Boolean value whether the tool is togglable.
	 * 		commandName: 	See more at https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
	 *		showDefaultUI:  See more at https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
	 *		valueArgument: 	See more at https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
	 */
	runCommand: function (clickedTool, isTogglable, commandName, showDefaultUI, valueArgument) {
		// Run command.
		document.execCommand(commandName, showDefaultUI, valueArgument);
		
		if (clickedTool.toolType == "text" && clickedTool.state == "active") {
			return;
		}

		// Disable tools of same type.
		if (isTogglable) {
			for (var t in editor.tools) {
				t = editor.tools[t];
				if (t != clickedTool && t.toolType == clickedTool.toolType && t.state == "active") editor.toggleTool(t);
			}
			// Enable clicked tool.
			editor.toggleTool(clickedTool);
		}
	},

	/*
	 * Enables or disables a tool.
	 * Sets tool's state active/inactive.
	 * Adds a specific active state indicating css class to tool button.
	 */
	toggleTool: function (tool) {

		// Set state of clicked tool.
		if (tool.state == "active") {
			tool.state = "inactive";
			tool.elem.classList.remove("active-tool");
		} else {
			tool.state = "active";
			tool.elem.classList.add("active-tool");
		}

	},

	updateActiveTools: function (event, caretPos) {
		
		// Update only if editing is active.
		if (this.tools["editViewToggle"].state == "active") {
		
			var tools = editor.tools;

			// Disable all active tools except edit mode tool.
			for (var tool in tools) {
				tool = tools[tool];
				if (tool.state == "active" && tool.name != "editViewToggle") {
					tool.elem.classList.remove("active-tool");
					tool.state = "inactive";
				}
			}

			var justify = caretPos.style["textAlign"];
			var fontWeight = window.getComputedStyle(caretPos, null).getPropertyValue('font-weight');
			var fontStyle = window.getComputedStyle(caretPos, null).getPropertyValue('font-style');
			var textDecoration = window.getComputedStyle(caretPos, null).getPropertyValue('text-decoration');

			// Toggle the tool in which the caret resides.
			switch(caretPos.nodeName) {
				case "P":
					editor.toggleTool(tools["p"]);
					break;

				case "H1":
					editor.toggleTool(tools["h1"]);
					break;

				case "H2":
					editor.toggleTool(tools["h2"]);
					break;

				case "H3":
					editor.toggleTool(tools["h3"]);
					break;

				case "H4":
					editor.toggleTool(tools["h4"]);
					break;
				case "A":
					editor.toggleTool(tools["link"]);
					break;

				default:
					break;

			}

			// Check whether caret inside listelement.
			var parent = caretPos.parentNode;
			switch(parent.nodeName) {

				case "LI":
					switch (parent.parentNode.nodeName) {
						case "UL":
							editor.toggleTool(tools["unorderedList"]);
							break;

						case "OL":
							editor.toggleTool(tools["orderedList"]);
							break;
						
						default:
							// statements_def
							break;
					}

					break;

				case "UL":
					editor.toggleTool(tools["unorderedList"]);
					break;

				case "OL":
					editor.toggleTool(tools["orderedList"]);
					break;

				default:
					break;
			}

			// Toggle justify tool.
			switch (justify) {
				case "right":
					editor.toggleTool(tools["justifyRight"]);
					break;
				
				case "center":
					editor.toggleTool(tools["justifyCenter"]);
					break;

				case "justify":
					editor.toggleTool(tools["justifyFull"]);
					break;

				default:
					editor.toggleTool(tools["justifyLeft"]);
					break;
			}

			// Toggle font styling tool.
			if (fontWeight == "bold") {
				editor.toggleTool(tools["bold"]);
			}
			if (fontStyle == "italic") {
				editor.toggleTool(tools["italic"]);
			}
			if (textDecoration == "underline") {
				editor.toggleTool(tools["underline"]);
			}

			editor.updateFontSelector(event);
		}
	},

	updateFontSelector: function (event) {

		var selector = document.getElementById("fontSize");

		switch (event.type) {
			case "click":
				var clickedElem = event.target;
				var fontsize = Math.floor(parseInt(window.getComputedStyle(clickedElem, null).getPropertyValue('font-size')));
				selector.value = fontsize + "px";
				break;
			
			case "keydown":
				var node = getSelection().anchorNode.parentNode;
				var fontsize = Math.floor(parseInt(window.getComputedStyle(node, null).getPropertyValue('font-size')));
				selector.value = fontsize + "px";
				break;
				
			default:
				// Do absolutely nothing.
				break;
		}
		
	},

	getCaretPosition: function (event) {
		var caretParent = window.getSelection().anchorNode.parentNode;
		editor.updateActiveTools(event, caretParent);
	},


	/* 
	 * Initializes editor.
	 * Adds the toolbar.
	 * Initializes the editable content area.
	 */
	initialize: function() {
		this.container = document.getElementById("editor");
		
		/** Create toolbar **/
		var toolbar = document.createElement('div');
		toolbar.id = "editor-toolbar";

		// Add the toolbar as the first element within the editor container.
		if (this.container.firstChild) this.container.insertBefore(toolbar, this.container.firstChild);
		else this.container.appendChild(toolbar);

		var container = document.createElement('div');
		var fieldset = document.createElement('fieldset');
		var legend = document.createElement('legend');
		fieldset.appendChild(legend);
		fieldset.appendChild(container);

		// Add tools to toolbar.
		for (var tool in this.tools) {
			var tool = this.tools[tool];

			if (tool.toolType != tooltype && tooltype != undefined ) {
				toolbar.appendChild(fieldset);
				var container = document.createElement('div');
				var fieldset = document.createElement('fieldset');
				var legend = document.createElement('legend');
				fieldset.appendChild(legend);
				fieldset.appendChild(container);
			}

			var tooltype = tool.toolType;
			legend.innerHTML = tooltype;

			// Add fontsize select element with available fontsizes. 
			if (tool.name == "fontSize") {
				var selectElement = document.createElement('select');
				selectElement.id = tool.name;
				selectElement.title = tool.tooltip;
				container.appendChild(selectElement);
				for (j=0; j<tool.sizes.length; j++) {
					var optionItem = document.createElement('option');
					optionItem.innerHTML = tool.sizes[j] + "px";
					selectElement.appendChild(optionItem);
					selectElement.addEventListener("change", tool.action);
					tool.elem = selectElement;
				}

			}
			// Add other buttons.
			else {
				var toolButton = document.createElement('button');
				toolButton.classList.add("tool");
				toolButton.id = tool.name;
				toolButton.title = tool.tooltip;
				toolButton.setAttribute('style', tool.style);
				if (tool.content != undefined) toolButton.innerHTML = tool.content;
				toolButton.addEventListener("click", tool.action);
				container.appendChild(toolButton);
				tool.elem = toolButton;
			}
		}
		toolbar.appendChild(fieldset);


		/** Initialize editable area. **/
			var editArea = document.getElementById("editor-content");
			var editable = document.createAttribute('contenteditable');
			editable.value = "true";
			editArea.setAttributeNode(editable);

		/** Set editing view enabled **/
		this.tools["editViewToggle"].elem.classList.add("active-tool");

		/** Editable area eventlisteners **/
			editArea.addEventListener("click", this.getCaretPosition, true);
			editArea.addEventListener("keyup", this.getCaretPosition, true);
	},
}