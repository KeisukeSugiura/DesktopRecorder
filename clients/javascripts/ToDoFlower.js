/**
 * Project, ToDoを花のように表現するUIオブジェクト
 */
class ToDoFlower{

	constructor(_project, _option){

		/*
			option:{
				boxRatio,
				circleRatio,
				orbitRatio,
				circleOrbitRatio,
				top,
				left,
				rotateDirection,
				userId
			}
		 */
		var option = _option || {}
		var project = _project || {
			projectName : "none",
			projectId : "none",
			projectColor : "ffff00"
		}

		this.targetElementId = option.id || "flower_div"
		this.userId = option.userId || "FlowerToDo"

		this.windowWidth = window.innerWidth
		this.windowHeight = window.innerHeight　
		this.rotateDirection = option.rotateDirection || 1
		
		this.flowerBoxRatio = option.boxRatio || 0.4						// 0.4 * window
		this.flowerCircleOrbitRatio = (option.circleOrbitRatio || 0.75) / 2	// 0.75 * 0.4 * window
		this.flowerCircleRatio = (option.circleRatio || 0.5) / 2				// 0.5 * 0.4 * window 
		this.flowerOrbitRatio = (option.orbitRatio || 0.2) / 2				// 0.2 * 0.1 * window

		this.flowerPositionTopRatio = option.boxTopRatio || 0.5
		this.flowerPositionLeftRatio = option.boxLeftRatio || 0.5 

		this.petalElements = []

		// event listener	
		this._onFlowerFrameChanged = (sizeDatas)=>{}

		this._setWindowResizeEvent()

		this._initToDoFlowerBoxElement(project)

		this._initToDoFlowerProjectElement(project)
		this._initToDoFlowerListElement(project)
		this._setFlowerFrame()

	}

	/*
		private method
	 */

	_setWindowResizeEvent(){
		var self = this;
		window.addEventListener('resize',(event)=>{
			self.windowWidth = window.innerWidth
			self.windowHeight = window.innerHeight
			self._setFlowerFrame()
		})
	}

	_initToDoFlowerBoxElement(project){
		this.boxElement = document.createElement("div")
		this.boxElement.className = "project_box_div"
		this.boxElement.style.width = String(this.flowerBoxSize) + "px"
		this.boxElement.style.height = String(this.flowerBoxSize) + "px"
		this.boxElement.style.top = String(this.flowerPositionTop) + "px"
		this.boxElement.style.left = String(this.flowerPositionLeft) + "px"
		this.boxElement.style.boxShadow = "0px 0px 100px -20px #"+project.projectColor
		
		document.getElementById(this.targetElementId).appendChild(this.boxElement)
		this._setBoxRotateAnimation(this.boxElement, this.rotateDirection)

	}

	_initToDoFlowerProjectElement(project){
		this.projectElement = document.createElement("div")
		this.projectElement.className = "project_circle_div"
		this.projectElement.id = project.projectId
		this.projectElement.style.backgroundColor = "#"+project.projectColor
		
		var titleDiv = document.createElement("div")
		var projectTitle = document.createElement("p")
		var projectDetail = document.createElement("p")

		projectTitle.innerHTML = "<strong>"+project.projectName+"</strong>"
		projectDetail.innerHTML = project.projectDetail

		titleDiv.appendChild(projectTitle)
		titleDiv.appendChild(projectDetail)

		this.projectElement.appendChild(titleDiv)
		this.boxElement.appendChild(this.projectElement)
		this._setOnClickProjectEvent(this.projectElement, project)
		this._setBoxRotateAnimation(this.projectElement, -1 * this.rotateDirection)

	}

	_initToDoFlowerListElement(project){
		if(project.todoList){
			this.todoListLength = project.todoList.length
			project.todoList.forEach((elm, ind, arr)=>{
				var todoElement = document.createElement('div')
				var angle = (ind * (360 / this.todoListLength) - 90) * (Math.PI / 180)
				console.log()

				todoElement.className = "todo_petal_div"
				todoElement.style.top = String(this.flowerBoxSize / 2 + this.flowerCircleOrbitRadius * Math.sin(angle)) + "px"
				todoElement.style.left = String(this.flowerBoxSize / 2 + this.flowerCircleOrbitRadius * Math.cos(angle)) + "px"
				todoElement.style.backgroundColor = "#" + elm.projectColor

				var titleDiv = document.createElement("div")
				var todoTitle = document.createElement("p")
				var todoPriority = document.createElement("p")
				var todoTag = document.createElement("p")

				var tagString = ""
				elm.tag.forEach((elm, ind, arr)=>{
					if(ind == 0){
						tagString = elm.tag
					}else{
						tagString = tagString + ", " + elm.tag
					}
				})

				todoTag.innerHTML = tagString
				todoTitle.innerHTML = "<strong>"+elm.title+"</storng>"
				todoPriority.innerHTML = "priority : " + String(elm.priority)

				if(String(elm.priority).length == 0){
					todoPriority.innerHTML = ""
				}

				titleDiv.appendChild(todoTitle)
				titleDiv.appendChild(todoPriority)
				titleDiv.appendChild(todoTag)
				todoElement.appendChild(titleDiv)
				this._setOnClickToDoEvent(todoElement, elm)

				this.petalElements.push(todoElement)
				this.boxElement.appendChild(todoElement)
				this._setBoxRotateAnimation(todoElement, -1 * this.rotateDirection)

			})
		}else{
			this.todoListLength = 0
		}
	}

	_setFlowerFrame(){
		var self = this;
		if(this.windowWidth < this.windowHeight){
			this.flowerBoxSize = this.flowerBoxRatio * this.windowWidth
		}else{
			this.flowerBoxSize = this.flowerBoxRatio * this.windowHeight
		}

		this.flowerCircleRadius = this.flowerCircleRatio * this.flowerBoxSize
		this.flowerCircleOrbitRadius = this.flowerCircleOrbitRatio * this.flowerBoxSize
		this.flowerOrbitRadius = this.flowerOrbitRatio * this.flowerBoxSize
		
		this.flowerPositionTop = this.windowHeight * this.flowerPositionTopRatio
		this.flowerPositionLeft = this.windowWidth * this.flowerPositionLeftRatio
		this._adaptFrameToFlowerElements()
		this._onFlowerFrameChanged({
			boxSize : self.flowerBoxSize,
			circleRadius : self.flowerCircleRadius,
			circleOrbitRadius : self.flowerCircleOrbitRadius,
			orbitRadius : self.flowerOrbitRadius,
			top : self.flowerPositionTop,
			left : self.flowerPositionLeft
		});
	}

	_adaptFrameToFlowerElements(){
		// uiにポジションサイズを反映
		this.boxElement.style.width = String(this.flowerBoxSize) + "px"
		this.boxElement.style.height = String(this.flowerBoxSize) + "px"
		this.boxElement.style.top = String(this.flowerPositionTop - this.flowerBoxSize / 2) + "px"
		this.boxElement.style.left = String(this.flowerPositionLeft - this.flowerBoxSize / 2) + "px"		

		this.projectElement.style.width = String(this.flowerCircleRadius * 2) + "px"
		this.projectElement.style.height = String(this.flowerCircleRadius * 2) + "px"
		this.projectElement.style.top = String(-1 * this.flowerCircleRadius) + "px"
		this.projectElement.style.left = String(-1 * this.flowerCircleRadius) + "px"

		this.petalElements.forEach((elm, ind, arr)=>{
			var angle = (ind * (360 / this.todoListLength) - 90) * (Math.PI / 180)
			elm.style.top = String(this.flowerBoxSize / 2 + this.flowerCircleOrbitRadius * Math.sin(angle) - this.flowerOrbitRadius) + "px"
			elm.style.left = String(this.flowerBoxSize / 2 + this.flowerCircleOrbitRadius * Math.cos(angle) - this.flowerOrbitRadius) + "px"
			this._setBoxRotateAnimation(elm, -1 * this.rotateDirection)
		});
	}

	/*
		public method
	 */

	addToDoElement(todo){
		this.todoListLength = this.todoListLength + 1
		var todoElement = document.createElement('div')
		console.log(todo.tag)

		//elementに情報を全部載せる
		todoElement.dataset.todoId = todo.todoId
		todoElement.dataset.limitTime = new Date(todo.limitTime)
		todoElement.dataset.priority = todo.priority
		todoElement.dataset.projectId = todo.projectId
		todoElement.dataset.projectName = todo.projectName
		todoElement.dataset.tag = todo.tag
		todoElement.dataset.title = todo.title

		todoElement.className = "todo_petal_div"
		todoElement.style.backgroundColor = "#" + todo.projectColor

		var titleDiv = document.createElement("div")
		var todoTitle = document.createElement("p")
		var todoPriority = document.createElement("p")
		var todoTag = document.createElement("p")

		todoTitle.innerHTML = "<strong>"+todo.title+"</storng>"
		todoPriority.innerHTML = "priority : " + String(todo.priority)

		if(!todo.priority){
			todoPriority.innerHTML = ""
		}

		var tagString = ""
		todo.tag.forEach((elm, ind, arr)=>{
			if(ind == 0){
				tagString = elm.tag
			}else{
				tagString = tagString + ", " + elm.tag
			}
		})

		todoTag.innerHTML = tagString

		titleDiv.appendChild(todoTitle)
		titleDiv.appendChild(todoPriority)
		titleDiv.appendChild(todoTag)
		todoElement.appendChild(titleDiv)

		this.petalElements.push(todoElement)
		this.boxElement.appendChild(todoElement)
		this._setOnClickToDoEvent(todoElement, todo)

		this._adaptFrameToFlowerElements()
		this._setBoxRotateAnimation(todoElement, -1 * this.rotateDirection)

	}

	

	_setOnClickToDoEvent(todoElement, todo){
		// 更新モーダル
		todoElement.addEventListener('click', (e)=>{
			update_todo_id_text.innerHTML = todo.todoId
			update_todo_title_input.value = todo.title
			update_todo_project_input.value = todo.projectName
			update_todo_priority_input.value = todo.priority
			
			var limitTime = new Date(todo.limitTime)
			var day = ("0" + limitTime.getDate()).slice(-2);
   			var month = ("0" + (limitTime.getMonth() + 1)).slice(-2);
  			var formatTime = limitTime.getFullYear()+"-"+(month)+"-"+(day) ;

			update_todo_date_input.value = formatTime

			update_todo_tag_list.innerHTML = ""
			todo.tag.forEach((elm, ind, arr)=>{

	  			todo_tag_input.value = ""

	  			var row = document.createElement('row')
	  			var label_div = document.createElement('div')
	  			var button_div = document.createElement('div')
	  			var label = document.createElement('legend')
	  			var button = document.createElement('input')

	  			row.dataset.tagName = elm.tag
	  			label_div.className = "col-md-6"
	  			button_div.className = "col-md-6"
	  			label_div.style.textAlign = "center"
	  			button_div.style.textAlign = "center"
	  			label.className = "control-label"
	  			label.innerHTML = elm.tag
	  			button.className = "btn btn-default"
	  			button.type = "button"
	  			button.value = "delete"

	  			label_div.appendChild(label)
	  			button_div.appendChild(button)
	  			row.appendChild(label_div)
	  			row.appendChild(button_div)
	  			update_todo_tag_list.appendChild(row)

	  			button.addEventListener('click',(e)=>{
	  				row.parentNode.removeChild(row);
	  			})
			})
			$('#updateToDoModal').modal()
		})
	}

	_setOnClickProjectEvent(element, project){
		element.addEventListener('click',(e)=>{
			update_project_id_text.innerHTML = project.projectId
			update_project_name_input.value = project.projectName
			update_project_color_input.value = project.projectColor
			update_project_detail_input.value = project.projectDetail
			if(project.projectOwnerId != this.userId){
				update_project_name_input.disabled = true
				update_project_color_input.disabled = true
				update_project_detail_input.disabled = true
				update_project_update_button.disabled = true
				update_project_delete_button.disabled = true
				update_project_complete_button.disabled = true
			}else{
				update_project_name_input.disabled = false
				update_project_color_input.disabled = false
				update_project_detail_input.disabled = false
				update_project_update_button.disabled = false
				update_project_delete_button.disabled = false
				update_project_complete_button.disabled = false
			}
			$('#updateProjectModal').modal()
		})
	}

	_setBoxRotateAnimation(element, direction){
		//回転する
		var self = this

		var rotateAnime = anime({
			targets: element,
			rotate: 360 * direction,
			loop: true,
			easing: "linear",
			duration:10000,
			autoplay:true
		})

		var play = () => {
			rotateAnime.play()
		}

		var pause = () => {
			rotateAnime.pause()
		}

		this.boxElement.addEventListener('mouseenter', pause)
		this.boxElement.addEventListener('mouseleave', play)

	}



	_setOnMouseOverToDoEvent(element){
		// 回転止まる
		

	}


	// set event listener
	setOnFlowerFrameChanged(callback){
		this._onFlowerFrameChanged = callback
	}

}




/**
 * ToDoを表現するUIオブジェクト
 */
class ToDoPetal{
	constructor(){

	}
}



class ToDoFlowerElement{

	constructor(project, sizeOption){

	}
}




