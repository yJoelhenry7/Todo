var token = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
function updateTodo(id){
   fetch(`/todos/${id}/markAsCompleted`,{
    method : "put",
    headers : {"Content-Type":"application/json"},
    body : JSON.stringify({
      "_csrf":token,
    }),
   }).then((res) => {
    if(res.ok){
      window.location.reload();
    }
   }).catch((err) =>{
     console.error(err);
   })
}
function deleteTodo(id){
  fetch(`/todos/${id}`,{
    method:"delete",
    headers:{"Content-Type":"application/json"},
    body : JSON.stringify({
      "_csrf":token,
    }),
  }).then((res)=>{
    if(res.ok){
      window.location.reload();
    }
  }).catch((err) =>{
     console.error(err);
   })
}
function validateForm() {
  let title = document.forms["newTodo"]["title"].value;
  let dueDate = document.forms["newTodo"]["dueDate"].value;
  if (title == "") {
    alert("Title Cannot be Empty");
    return false;
  }
 else if (dueDate == "") {
    alert("DueDate Cannot be Empty");
    return false;
  }
}