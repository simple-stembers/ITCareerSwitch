// Get the modal overlay and content elements
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.querySelector('.modal-content');

// Get the close button element
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
    if (isLongClick) return;
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

    // Get the viewport width and height
    const viewportWidth = window.innerWidth;
    
   
    // Calculate the modal position
    let modalPosition;


    if (clickX < viewportWidth / 2) {
        modalPosition = 'right-modal';
      } else {
        // You can add a default modal position or a different behavior for clicks near the center
        modalPosition = 'left-modal'; // or 'left-modal'
      }

    // Add the modal position class to the modal content
    modalOverlay.classList.add(modalPosition);
    isModalOpen = true;
    // Show the modal overlay
   
   console.log(modalOverlay.classList);
    
      modalOverlay.classList.add('show');
    
      console.log(modalOverlay.classList);
  }
}});

document.addEventListener('touchend', (e) => {
  if (isLongClick) return;
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

  // Get the viewport width and height
  const viewportWidth = window.innerWidth;

 
  // Calculate the modal position
  let modalPosition;


  if (clickX < viewportWidth / 2) {
      modalPosition = 'right-modal';
    } else {
      // You can add a default modal position or a different behavior for clicks near the center
      modalPosition = 'left-modal'; // or 'left-modal'
    }

  // Add the modal position class to the modal content
  modalOverlay.classList.add(modalPosition);
  isModalOpen = true;
  // Show the modal overlay
 
 console.log(modalOverlay.classList);
  
    modalOverlay.classList.add('show');
  
    console.log(modalOverlay.classList);
}
}});

// Add an event listener to the close button click event
closeButton.addEventListener('click', () => {
  // Hide the modal overlay
  modalOverlay.classList.remove('show');
  console.log(modalOverlay.classList);
  // Wait for the transition to complete before removing the position classes and adding the hide class
  setTimeout(() => {
    modalOverlay.classList.remove('left-modal', 'right-modal');
    
    console.log(modalOverlay.classList);
  }, 800);

  // Remove the modal position class from the modal content
  isModalOpen = false;
});

closeButton.addEventListener('touchend', () => {
  // Hide the modal overlay
  modalOverlay.classList.remove('show');
  console.log(modalOverlay.classList);
  // Wait for the transition to complete before removing the position classes and adding the hide class
  setTimeout(() => {
    modalOverlay.classList.remove('left-modal', 'right-modal');
    
    console.log(modalOverlay.classList);
  }, 800);

  // Remove the modal position class from the modal content
  isModalOpen = false;
});