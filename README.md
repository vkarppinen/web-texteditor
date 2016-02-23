# web-texteditor

A very simple text editor written in javascript. See this [live demo](http://users.jyu.fi/~juvakarp/editor).
 
 
### Usage

1. Reference the editor.js and editor.css files in your html template.
   
2. For using the text-editor in a HTML page, the template should be organised as follows:
  - The editor will be initialised within the #editor -element. (should be a div element)
  - The content that is edited will be within the #editor-content -element. (div preferred also)
  ```html
    <div id="editor">
	    <div id="editor-content">
        <!-- Your text will be edited within this element -->
	    </div>
    </div>
  ```

3. To initialize the editor for content editing use the following code snippet:
  - This presumes that editor.js javascript file is referenced in your html.
  ```javascript
    editor.initialize();
  ```
 
 
### Upcoming updates
  
  
#### Problems
- Some issues inserting ul and ol. If block is formatted as a paragraph, the newly created ul or ol will be created inside the paragraph block.
