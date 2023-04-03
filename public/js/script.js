function updateTodo(id){
   fetch(`/todos/${id}/markAsCompleted`,{
    method : "put",
    headers : {"Content-Type":"application/json"},
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
  }).then((res)=>{
    if(res.ok){
      window.location.reload();
    }
  }).catch((err) =>{
     console.error(err);
   })
}