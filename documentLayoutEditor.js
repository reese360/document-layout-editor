function initWorkspace(container) {
	new DocumentLayoutEditor(container);
}

// CLASSES
//* base class for all panel objects
class PanelObject {
	constructor() {
		this._id = Math.floor(Math.random() * 1000000);
	}

	get id() {
		return this._id;
	}
}

//* container class for workspace area
class DocumentLayoutEditor extends PanelObject {
	constructor(workspaceContainer) {
		super();
		this.documentCount = 0;
		this.threshold = 0.2;
		this.object = $('<div/>', {
			id: this.id,
			class: 'document_workspace',
		}).appendTo(workspaceContainer);

		this.containers = [this.initNewDocumentContainer(), this.initNewDocumentContainer()];
		this.object.css('grid-template-areas', `"dock_${this.containers[0].id} dock_${this.containers[1].id}"`);
		this.initNewDocument(this.containers[0]); // create blank document
		this.initNewDocument(this.containers[1]); // create blank document
	}

	initNewDocumentContainer() {
		var documentContainer = new DocumentContainer();
		this.object.append(documentContainer.object);
		return documentContainer;
	}

	initNewDocument(container) {
		//create new document tab
		var tab = new DocumentHeader(Date.now(), this.id);

		// tab drag controls
		let self = this;
		tab.object.draggable({
			containment: `#${this.id}`, // keep div contained within workspace bounds
			scroll: false,
			start: function () {

				$('.drop_grid').css('display', 'grid'); // draw drop zones
			},
			drag: function (e) {
				tab.dropZone = $('.drop_grid:hover');
				try {
					var bounds = tab.dropZone[0].getBoundingClientRect(); // get drop zone bounds

					// left
					if (e.clientX > bounds.left && e.clientX < bounds.left + bounds.width * self.threshold) {
						$('.drop_grid > div').removeClass('active_drop_zone'); // hide drag-grid lines
						$(`#${tab.dropZone.attr('id')}_zone1`).addClass('active_drop_zone');
						$(`#${tab.dropZone.attr('id')}_zone3`).addClass('active_drop_zone');
					}

					// right
					else if (e.clientX < bounds.right && e.clientX > bounds.right - bounds.width * self.threshold) {
						$('.drop_grid > div').removeClass('active_drop_zone'); // hide drag-grid lines
						$(`#${tab.dropZone.attr('id')}_zone2`).addClass('active_drop_zone');
						$(`#${tab.dropZone.attr('id')}_zone4`).addClass('active_drop_zone');
					}

					// top
					else if (e.clientY > bounds.top && e.clientY < bounds.top + bounds.height * self.threshold) {
						$('.drop_grid > div').removeClass('active_drop_zone'); // hide drag-grid lines
						$(`#${tab.dropZone.attr('id')}_zone1`).addClass('active_drop_zone');
						$(`#${tab.dropZone.attr('id')}_zone2`).addClass('active_drop_zone');
					}

					// bottom 
					else if (e.clientY < bounds.bottom && e.clientY > bounds.bottom - bounds.height * self.threshold) {
						$('.drop_grid > div').removeClass('active_drop_zone'); // hide drag-grid lines
						$(`#${tab.dropZone.attr('id')}_zone3`).addClass('active_drop_zone');
						$(`#${tab.dropZone.attr('id')}_zone4`).addClass('active_drop_zone');
					}

					// center
					else {
						$('.drop_grid > div').removeClass('active_drop_zone'); // hide drag-grid lines
						$(`#${tab.dropZone.attr('id')}_zone1`).addClass('active_drop_zone');
						$(`#${tab.dropZone.attr('id')}_zone2`).addClass('active_drop_zone');
						$(`#${tab.dropZone.attr('id')}_zone3`).addClass('active_drop_zone');
						$(`#${tab.dropZone.attr('id')}_zone4`).addClass('active_drop_zone');
					}
				} catch (err) {
					//console.log(err);
				}
			},
			stop: function (e) {
				$('.drop_grid').css('display', 'none'); // hide drag-grid lines
				$('.drop_grid > div').removeClass('active_drop_zone'); // hide drag-grid lines
			},
		});

		container.tabBar.addTab(tab); // insert tab
		this.documentCount += 1;
	}
}

//* grid containing dropable areas for tabs
class DropGrid extends PanelObject {
	constructor(containerId) {
		super();
		this.object = $('<div/>', {
			id: `${containerId}_dragGrid`,
			class: 'drop_grid',
			html: `<div id="${containerId}_dragGrid_zone1" class="drag_area_1"></div><div id="${containerId}_dragGrid_zone2" class="drag_area_2"></div><div id="${containerId}_dragGrid_zone3" class="drag_area_3"></div><div id="${containerId}_dragGrid_zone4" class="drag_area_4"></div>`,
			//style: 'display: none;',
			css: {
				'display': 'grid',
				'width': '100%',
				'height': '100%'
			}
		});
	}
}

//* container class for documents
class DocumentContainer extends PanelObject {
	constructor() {
		super();
		this.object = $('<div/>', {
			id: this.id,
			class: 'document_container',
			css: {
				'grid-area': `dock_${this.id.toString()}`,
			}
		});
		//this.object.css("grid-area", 'reese');

		this.grid = new DropGrid(this.id);
		this.object.append(this.grid.object);

		this.tabBar = new DocumentBar();
		this.object.append(this.tabBar.object);
	}
}

//* tab control and docking area
class DocumentBar extends PanelObject {
	constructor() {
		super();
		this.currentTabs = [];

		// list of items on docket
		this.items = $('<ul/>', {
			id: `ul_${this.id}`,
		});

		// html of the document bar tab
		this.object = $('<div/>', {
			id: this.id,
			class: 'document_header_bar',
			html: this.items,
		});
	}

	addNewTab(title, container) {
		var tab = new DocumentHeader(title, container);
		this.items.append(tab.object);

		this.currentTabs.push(tab);
	}

	addTab(tab) {
		this.items.append(tab.object);
		this.currentTabs.push(tab);
	}
}

//* document content
class DocumentBody extends PanelObject {
	constructor() {
		super();
	}
}

//* document tab class
//* draggable to new positions
class DocumentHeader extends PanelObject {
	constructor(title, container) {
		super();
		title = `${title}_${parseInt(this.id)}`; // TODO tab title goes here (using unique id property for now)

		this.closeBtn = $('<i/>', {
			class: 'fas fa-times close_button',
		}).on('click', function () {
			// TODO add tab closing logic here
		});

		this.object = $('<li/>', {
			class: 'document_header',
			html: `<i class="far fa-file-image" style="font-size:14px;"></i> &nbsp; ${title} &nbsp; &nbsp;`,
		});
		this.object.append(this.closeBtn); // add close button to end of div

		//let self = this;
		//this.object.draggable({
		//	containment: `#${container}`, // keep div contained within workspace bounds
		//	scroll: false,
		//	start: function () {
		//		$('#DragGrid').css('display', 'grid');
		//	},
		//	drag: function (e) {
		//		//var dragX = (e.clientX - $(event.target).offset().left);
		//		//var dragY = (e.clientY - $(event.target).offset().top);
		//	},
		//	stop: function (e) {
		//		try {
		//			var element = $('#DragGrid > div:hover'); // get the drag grid position
		//			self.object.position({
		//				of: element,
		//				my: 'left top',
		//				at: 'left top',
		//			});
		//		} catch (err) {
		//			self.object.removeAttr('style'); // move back to original tab bar
		//		} finally {
		//			$('#DragGrid').css('display', 'none'); // hide grid lines
		//		}
		//	},
		//});
	}
}