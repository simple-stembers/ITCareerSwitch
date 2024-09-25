// Get the modal overlay and content elements
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.querySelector('.modal-content');

// initial variables that will be used throughout. The long click variable is used to determine whether the user is scrolling the map or clicking it.
const closeButton = document.getElementById('close-modal');
let isModalOpen=false;
let isLongClick = false;
let clickInitial = 0;

document.addEventListener('pointerdown', (e) => {
  clickInitial = new Date().getTime();
});

document.addEventListener('pointerup', (e) => {
  
  const clickDuration = new Date().getTime() - clickInitial;

  if (clickDuration > 200) { // adjust this value to your liking
    isLongClick = true;
  } else {
    isLongClick = false;
  }
});



// Add an event listener to the map click event
document.addEventListener('click', (e) => {
  //if a long click is registered, then the modal overlay is not opened
    if (isLongClick) return;
  //if a marker showing POIs is clicked, then the modal overlay is not opened to allow users to explore nearby POIs
    if (e.target.classList.contains('leaflet-marker-icon')) {
    return;}
    else{

    
    if (isModalOpen) return; // If a modal is already open, do nothing

    console.log('Click event triggered');
    console.log('Event object:', e);
  // Check if the click event is on the map
  if (e.target.closest('#map, .countryBorders')) {
    console.log('Map element clicked');
    // Get the click position
    const clickX = e.clientX;
    

    console.log('Click position:', clickX);

    //the following code is to allow the modal overlay to open on the side of the screen that was not clicked. This only applies to larger screens
    const viewportWidth = window.innerWidth;
    
   
    
    let modalPosition;


    if (clickX < viewportWidth / 2) {
        modalPosition = 'right-modal';
      } else {
        
        modalPosition = 'left-modal'; 
      }

    // Add the modal position class to the modal content
    modalOverlay.classList.add(modalPosition);
    isModalOpen = true;
    // Show the modal overlay
   
   
    //this final step causes the modal overlay to appear after it's side of the screen has been decided.
      modalOverlay.classList.add('show');
    
      
  }
}});



// This is the close button for the modal overlay
closeButton.addEventListener('click', () => {
 
  modalOverlay.classList.remove('show');
  console.log(modalOverlay.classList);
  // This is just a timeout to match the animation time of the fade out
  setTimeout(() => {
    modalOverlay.classList.remove('left-modal', 'right-modal');
    isModalOpen = false;
    console.log(modalOverlay.classList);
  }, 800);

  
  
});

