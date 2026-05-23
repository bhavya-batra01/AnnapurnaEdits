// ====== DATA ======
let recipes = JSON.parse(localStorage.getItem("recipes")) || [];
let currentIndex = null;
let editingIndex = null;

// TRACK CURRENT USER / ADMIN
let currentUser = localStorage.getItem("currentUser") || null;
let isAdmin = localStorage.getItem("admin") === "true";

// ELEMENTS
const recipeList = document.getElementById("recipeList");
const mostLiked = document.getElementById("mostLiked");
const rTitle = document.getElementById("rTitle");
const rImg = document.getElementById("rImg");
const rIngredients = document.getElementById("rIngredients");
const rSteps = document.getElementById("rSteps");
const rComments = document.getElementById("rComments");
const recipeModal = document.getElementById("recipeModal");
const addModal = document.getElementById("addModal");
const deleteBtn = document.getElementById("deleteBtn");
const editBtn = document.getElementById("editBtn");
const likeCount = document.getElementById("likeCount");
const commentCount = document.getElementById("commentCount");
const currentUserDisplay = document.getElementById("currentUserDisplay");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const addRecipeBtn = document.getElementById("addRecipeBtn");
const mostLovedSection = document.querySelector(".choice");

// ====== HEADER UPDATE ======
function updateHeader() {
  if(isAdmin){
    currentUserDisplay.innerText = "Logged in as Admin";
    addRecipeBtn.style.display = "inline-block";
    logoutBtn.style.display = "inline-block";
    loginBtn.style.display = "none";
  } else if(currentUser){
    currentUserDisplay.innerText = currentUser;
    addRecipeBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    loginBtn.style.display = "none";
  } else {
    currentUserDisplay.innerText = "";
    addRecipeBtn.style.display = "none";
    logoutBtn.style.display = "none";
    loginBtn.style.display = "inline-block";
  }
}

// LOGOUT
function adminLogout(){
  isAdmin=false;
  currentUser=null;
  localStorage.removeItem("admin");
  localStorage.removeItem("currentUser");
  updateHeader();
}

// ====== LOCAL STORAGE SAVE ======
function save(){ localStorage.setItem("recipes", JSON.stringify(recipes)); }

// ====== RENDER RECIPES ======
function renderRecipes(list=recipes){
  recipeList.innerHTML="";
  if(!list.length){
    document.getElementById("noResults").style.display="block";
    return;
  }
  document.getElementById("noResults").style.display="none";
  list.forEach((r,i)=>{
    recipeList.innerHTML += `
      <div class="item" onclick="openRecipe(${i})">
        <img src="${r.img}">
        <h3>${r.title}</h3>
        <p>❤️ ${r.likes||0} | 💬 ${r.comments? r.comments.length:0}</p>
      </div>
    `;
  });
}

function renderMostLiked(){
  mostLiked.innerHTML="";
  [...recipes].sort((a,b)=> (b.likes||0) - (a.likes||0))
    .slice(0,3)
    .forEach((r,i)=>{
      mostLiked.innerHTML += `
        <div class="item" onclick="openRecipe(${i})">
          <img src="${r.img}">
          <h3>${r.title}</h3>
          <p>❤️ ${r.likes||0} | 💬 ${r.comments? r.comments.length:0}</p>
        </div>
      `;
    });
}

// ====== OPEN RECIPE ======
function openRecipe(i){
  currentIndex=i;
  const r=recipes[i];
  rTitle.innerText=r.title;
  rImg.src=r.img;
  likeCount.innerText=r.likes||0;
  commentCount.innerText = `💬 ${r.comments? r.comments.length:0}`;
  rIngredients.innerHTML = (r.ingredients||[]).map(x=> `<li>${x}</li>`).join("");
  rSteps.innerHTML = (r.steps||[]).map(x=> `<li>${x}</li>`).join("");
  rComments.innerHTML = (r.comments||[]).map(c=> `<li>${c.user}: ${c.text}</li>`).join("");
  deleteBtn.style.display=isAdmin?"block":"none";
  editBtn.style.display=isAdmin?"block":"none";
  recipeModal.style.display="flex";
}

// ====== LIKE FUNCTION ======
function likeRecipe(){
  if(!currentUser){ alert("Login as a user to like"); return; }
  const r = recipes[currentIndex];
  if(!r.likedUsers) r.likedUsers=[];
  if(r.likedUsers.includes(currentUser)){
    alert("You already liked this recipe");
    return;
  }
  r.likes = (r.likes||0)+1;
  r.likedUsers.push(currentUser);
  save();
  likeCount.innerText=r.likes;
  renderRecipes();
  renderMostLiked();
}

// ====== COMMENT FUNCTION ======
function addComment(){
  if(!currentUser){ alert("Login as a user to comment"); return; }
  const input=document.getElementById("commentInput");
  if(!input.value) return;
  if(!recipes[currentIndex].comments) recipes[currentIndex].comments=[];
  recipes[currentIndex].comments.push({user: currentUser, text: input.value});
  input.value="";
  save();
  rComments.innerHTML = recipes[currentIndex].comments.map(c=> `<li>${c.user}: ${c.text}</li>`).join("");
  commentCount.innerText = `💬 ${recipes[currentIndex].comments.length}`;
  renderRecipes();
  renderMostLiked();
  scrollToComments();

}

// ====== ADD/EDIT/DELETE ======
function deleteRecipe(){ 
  if(confirm("Are you sure?")){
    recipes.splice(currentIndex,1); save(); closeRecipe(); renderRecipes(); renderMostLiked(); 
  }
}

function editRecipe(){
  editingIndex=currentIndex;
  const r=recipes[currentIndex];
  addModal.style.display="flex";
  document.getElementById("addTitle").innerText="Edit Recipe";
  document.getElementById("name").value=r.title;
  document.getElementById("category").value=r.category;
  document.getElementById("season").value=r.season;
  document.getElementById("ingredients").value=r.ingredients.join(",");
  document.getElementById("steps").value=r.steps.join(",");
  document.getElementById("preview").src=r.img;
  document.getElementById("preview").style.display="block";
}

function closeRecipe(){recipeModal.style.display="none";}
function closeAdd(){addModal.style.display="none"; editingIndex=null; document.getElementById("addTitle").innerText="Add Recipe";}
function previewImage(e){const reader=new FileReader(); reader.onload=()=>{document.getElementById("preview").src=reader.result; document.getElementById("preview").style.display="block";}; reader.readAsDataURL(e.target.files[0]);}
function showAddModal(){addModal.style.display="flex"; editingIndex=null; document.getElementById("addTitle").innerText="Add Recipe";}

function saveRecipe(){
  const r={
    title: document.getElementById("name").value,
    img: document.getElementById("preview").src,
    category: document.getElementById("category").value,
    season: document.getElementById("season").value,
    ingredients: document.getElementById("ingredients").value.split(","),
    steps: document.getElementById("steps").value.split(","),
    likes: editingIndex!==null? recipes[editingIndex].likes : 0,
    comments: editingIndex!==null? recipes[editingIndex].comments||[] : [],
    likedUsers: editingIndex!==null? recipes[editingIndex].likedUsers||[] : []
  };
  if(editingIndex!==null){recipes[editingIndex]=r;} else {recipes.push(r);}
  save(); renderRecipes(); renderMostLiked(); closeAdd();
}

function searchRecipes() {
  const value = document.getElementById("searchInput").value.toLowerCase().trim();

  if (!value) {
    renderRecipes(recipes);
    return;
  }

  const filtered = recipes.filter(r =>
    r.title.toLowerCase().includes(value) ||
    r.category.toLowerCase().includes(value) ||
    r.season.toLowerCase().includes(value) ||
    (r.ingredients && r.ingredients.join(" ").toLowerCase().includes(value))
  );

  renderRecipes(filtered);
}

function filterCategory(c){renderRecipes(recipes.filter(r=>r.category===c));}
function filterSeason(s){renderRecipes(recipes.filter(r=>r.season===s));}
function scrollToComments(){
  const section = document.getElementById("commentsSection");
  if(section){
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}


// ====== INITIAL CALL ======
updateHeader();
renderRecipes();
renderMostLiked();
