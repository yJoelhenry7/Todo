var token = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
function updateTodo(id,currentStatus){
   fetch(`/todos/${id}`,{
    method : "put",
    headers : {"Content-Type":"application/json"},
    body : JSON.stringify({
      completed: !currentStatus,
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