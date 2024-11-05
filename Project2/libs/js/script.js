//-------------------------------------------------------
//GLOBAL VARIABLES
//-------------------------------------------------------

var sortOrder = {};

//-------------------------------------------------------
//EVENT HANDLERS
//-------------------------------------------------------

//------------SEARCH,FILTER AND ADD---------------------
$("#searchInp").on("keyup", function () {
  
    var query = $(this).val().toLowerCase();

        searchTables(query);
       
});
    
  
$("#refreshBtn").click(function () {

    $("#searchInp").val("");
    
    if ($("#personnelBtn").hasClass("active")) {
      
      populatePersonnelTable();
      
    } else {
      
      if ($("#departmentsBtn").hasClass("active")) {
        
       populateDepartmentTable();
        
      } else {
        
       populateLocationTable();
        
      }
      
    }
    
});
  
$("#filterBtn").click(function () {

    $("#searchInp").val("");
    
    populateFilterDropdowns();

    $("#filterModal").modal("show");
    
});

$("#filterDepartment").change(function () {

    filterTables();
    updateFilterOptions();
   

});

$("#filterLocation").change(function () {

    filterTables();
    updateFilterOptions();

});



$("#addBtn").click(function () {


    
    if ($("#personnelBtn").hasClass("active")) {
      
        $("#addPersonnelModal").modal("show");
        
      } else {
        
        if ($("#departmentsBtn").hasClass("active")) {
          
         $("#addDepartmentModal").modal("show");
          
        } else {
          
         $("#addLocationModal").modal("show");
          
        }
      }
});

$("#personnelBtn").click(function () {
    $("#searchInp").val("");
    
    populatePersonnelTable();
    
});
  
$("#departmentsBtn").click(function () {
    $("#searchInp").val("");
    
    populateDepartmentTable();
    
});
  
$("#locationsBtn").click(function () {
    $("#searchInp").val("");
    
    populateLocationTable();
    
});

$('.sortable').click(function () {
    var table = $(this).closest('table');
    var column = $(this).index();
    var columnName = $(this).data('column');

    // Toggle sort order
    if (!sortOrder[columnName]) {
        sortOrder[columnName] = 'asc';
    } else {
        sortOrder[columnName] = sortOrder[columnName] === 'asc' ? 'desc' : 'asc';
    }

    sortTable(table, column, sortOrder[columnName]);
});

//------------------------PERSONNEL LISTENERS------------------------

$("#addPersonnelModal").on("show.bs.modal", function () {
    $.ajax({
        url: "./libs/php/getAllDepartments.php",
        type: "GET",
        dataType: "json",
        success: function (result) {
            var resultCode = result.status.code;

            if (resultCode == 200) {
                $("#addPersonnelDepartment").html("<option value=''>Select Department</option>");

                $.each(result.data, function () {
                    $("#addPersonnelDepartment").append(
                        $("<option>", {
                            value: this.id,
                            text: this.departmentName
                        })
                    );
                });
            } else {
                $("#addPersonnelModal .modal-title").replaceWith(
                    "Error retrieving data"
                );
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $("#addPersonnelModal .modal-title").replaceWith(
                "Error retrieving data"
            );
        }
    });
})

$("#addPersonnelModal").on("hidden.bs.modal", function () {
    // Reset all fields to their default values
    $("#addPersonnelForm")[0].reset();
    $("#addPersonnelDepartment").html("<option value=''>Select Department</option>");
});

$("#addPersonnelForm").on("submit", function(e) {
    e.preventDefault();

    var firstName = $("#addPersonnelFirstName").val();
    var lastName = $("#addPersonnelLastName").val();
    var jobTitle = $("#addPersonnelJobTitle").val();
    var email = $("#addPersonnelEmail").val();
    var departmentID = $("#addPersonnelDepartment").val();

    if (departmentID === "") {
        alert("Please select a department.");
        return;
    }

    $.ajax({
        url: "./libs/php/insertPersonnel.php",
        type: "POST",
        dataType: "json",
        data: {
            firstName: firstName,
            lastName: lastName,
            jobTitle: jobTitle,
            email: email,
            departmentID: departmentID
        },
        success: function (result) {
            if (result.status.code === "200") {
               
                $("#addPersonnelModal").modal("hide");
                $("#resultAddPersonnelModal").modal("show");
                populatePersonnelTable();
            } else {
                $("#addPersonnelResult").text("Sorry, there was an issue adding the employee. Please try again.");
                $("#addPersonnelModal").modal("hide");
                $("#resultAddPersonnelModal").modal("show");
                populatePersonnelTable();
                
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX call failed: " + textStatus);
        }
    });

});


  
$("#editPersonnelModal").on("show.bs.modal", function (e) {
    var personnelID = $(e.relatedTarget).data("id");
    $.ajax({
      url:
        "./libs/php/getPersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: personnelID
      },
      success: function (result) {
        
  
        if (result.status.code === "200" && result.data.personnel.length > 0) {
          
          
  
          $("#editPersonnelID").val(result.data.personnel[0].id);
  
          $("#editPersonnelFirstName").val(result.data.personnel[0].firstName);
          $("#editPersonnelLastName").val(result.data.personnel[0].lastName);
          $("#editPersonnelJobTitle").val(result.data.personnel[0].jobTitle);
          $("#editPersonnelEmailAddress").val(result.data.personnel[0].email);
  
          $("#editPersonnelDepartment").html("");
  
          $.each(result.data.department, function () {
            $("#editPersonnelDepartment").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );
          });
  
          $("#editPersonnelDepartment").val(result.data.personnel[0].departmentID);
          
        } else {
          $("#editPersonnelModal .modal-title").replaceWith(
            "Error retrieving data"
          );
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#editPersonnelModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    });
});
  
$("#editPersonnelModal").on("hidden.bs.modal", function () {
    // Reset all fields to their default values
    $("#editPersonnelForm")[0].reset();
    $("#editPersonnelDepartment").html("<option value=''>Select Department</option>");
}); 
  
  $("#editPersonnelForm").on("submit", function (e) {
    
    e.preventDefault();

    var personnelID = $("#editPersonnelID").val();
    var firstName = $("#editPersonnelFirstName").val();
    var lastName = $("#editPersonnelLastName").val();
    var jobTitle = $("#editPersonnelJobTitle").val();
    var email = $("#editPersonnelEmailAddress").val();
    var departmentID = $("#editPersonnelDepartment").val();

    $.ajax({
        url: "./libs/php/editPersonnel.php",
        type: "POST",
        dataType: "json",
        data: {
            id: personnelID,
            firstName: firstName,
            lastName: lastName,
            jobTitle: jobTitle,
            email: email,
            departmentID: departmentID
        },
        success: function (result) {
            if (result.status.code === "200") {
                
                $("#editPersonnelModal").modal("hide");
                $("#resultEditPersonnelModal").modal("show");
                populatePersonnelTable(); // Refresh the table
            } else {
                $("#editPersonnelResult").text("Sorry, there was an issue editing the employee. Please try again.");
                $("#editPersonnelModal").modal("hide");
                $("#resultEditPersonnelModal").modal("show");
                populatePersonnelTable();
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX call failed: " + textStatus);
        }
    });
});
    
    


  $("#deletePersonnelModal").on("show.bs.modal", function (e) {
    var personnelID = $(e.relatedTarget).data("id");
    $("#deletePersonnelID").val(personnelID);
    populateDeletePersonnelName(personnelID);
  });

  $("#deletePersonnelModal").on("hidden.bs.modal", function () {
    // Reset all fields to their default values
    $("#deletePersonnelForm")[0].reset();
}); 

  $("#deletePersonnelModalBtn").on("click", function (e) {
    e.preventDefault();

       
        $.ajax({
            url: "./libs/php/deletePersonnelByID.php",
            type: "POST",
            dataType: "json",
            data: {
                id: $("#deletePersonnelID").val()
            },
            success: function (result) {
                if (result.status.code === "200") {
                    
                    $("#deletePersonnelModal").modal("hide");
                    $("#resultDeletePersonnelModal").modal("show");
                    populatePersonnelTable(); 
                } else {
                    $("#deletePersonnelResult").text("Sorry, there was an issue deleting the employee. Please try again.");
                    $("#deletePersonnelModal").modal("hide");
                    $("#resultDeletePersonnelModal").modal("show");
                    populatePersonnelTable();
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert("AJAX call failed: " + textStatus);
            }
        });
    });



//------------DEPARTMENT LISTENERS---------------------


  $("#addDepartmentModal").on("show.bs.modal", function () {
    populateLocationDropdown();
      
  })

  $("#addDepartmentModal").on("hidden.bs.modal", function () {
    // Reset all fields to their default values
    $("#addDepartmentForm")[0].reset();
});

  $("#addDepartmentForm").on("submit", function (e) {
    e.preventDefault();

    $.ajax({
        url: "./libs/php/insertDepartment.php",
        type: "POST",
        dataType: "json",
        data: {
            name: $("#addDepartmentName").val(),
            locationID: $("#addDepartmentLocation").val()
        },
        success: function (result) {
            if (result.status.code == 200) {
                $("#addDepartmentModal").modal("hide");
                $("#resultAddDepartmentModal").modal("show");
                populateDepartmentTable();
                // Refresh the department table or update the UI as needed
            } else {
                $("#addDepartmentResult").text("Sorry, there was an issue adding the department. Please try again.");
                $("#addDepartmentModal").modal("hide");
                $("#resultAddDepartmentModal").modal("show");
                populateDepartmentTable();
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Error adding department: " + textStatus);
        }
    });
});

$("#editDepartmentModal").on("show.bs.modal", function (e) {
    var departmentID = $(e.relatedTarget).data("id");
        console.log("Department ID: ", departmentID); // Log the department ID to check if it's correctly retrieved

        // Populate the location dropdown first
        populateLocationDropdown(function () {
            // After the location dropdown is populated, fetch the department details
            $.ajax({
                url: "./libs/php/getDepartmentByID.php",
                type: "POST",
                dataType: "json",
                data: {
                    id: departmentID
                },
                success: function (result) {
                    console.log(result); // Log the response to check the data structure
                    if (result.status.code === "200") {
                        var department = result.data[0];
                        $("#editDepartmentID").val(department.id);
                        $("#editDepartmentName").val(department.name);
                        $("#editDepartmentLocation").val(department.locationID);
                    } else {
                        alert("Error: " + result.status.description);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("AJAX call failed: " + textStatus);
                }
            });
        });
 });

 $("#editDepartmentModal").on("hidden.bs.modal", function () {
    // Reset all fields to their default values
    $("#editDepartmentForm")[0].reset();
});


$("#editDepartmentForm").on("submit", function (e) {
   
    e.preventDefault();

    var departmentID = $("#editDepartmentID").val();
    var name = $("#editDepartmentName").val();
    var locationID = $("#editDepartmentLocation").val();
   

    $.ajax({
        url: "./libs/php/editDepartment.php",
        type: "POST",
        dataType: "json",
        data: {
            id: departmentID,
            name: name,
            locationID: locationID
        },
        success: function (result) {
            if (result.status.code === "200") {
               
                $("#editDepartmentModal").modal("hide");
                $("#resultEditDepartmentModal").modal("show");
                populateDepartmentTable(); // Refresh the table
            } else {
                $("#editDepartmentResult").text("Sorry, there was an issue editing the department. Please try again.");
                $("#editDepartmentModal").modal("hide");
                $("#resultEditDepartmentModal").modal("show");
                populateDepartmentTable();
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX call failed: " + textStatus);
        }
    });

});

$(document).on("click", ".deleteDepartmentBtn", function () {
    console.log("Delete button clicked");
    dataId=$(this).data("id");
    $("#deleteDepartmentID").val(dataId);
    console.log(dataId);
    checkDepartment(dataId);
});






$("#deleteDepartmentModalBtn").on("click", function () {

   console.log("the deleted id is: ", $("#deleteDepartmentID").val());
  

    $.ajax({
        url: "./libs/php/deleteDepartmentByID.php",
        type: "POST",
        dataType: "json",
        data: {
            id: $("#deleteDepartmentID").val()  
        },
        success: function (result) {
            if (result.status.code === "200") {
                
                $("#deleteDepartmentModal").modal("hide");
                $("#resultDeleteDepartmentModal").modal("show");
                populateDepartmentTable(); // Refresh the table
            } else {
                $("#deleteDepartmentResult").text("Sorry, there was an issue deleting the department. Please try again.")
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX call failed: " + textStatus);
        }
        });
});


//------------LOCATION LISTENERS---------------------

$("#addLocationModal").on("hidden.bs.modal", function () {
    // Reset all fields to their default values
    $("#addLocationForm")[0].reset();
});

$("#addLocationForm").on("submit", function (e) {


    e.preventDefault();

    // Get the submitted location name and capitalize the first letter
    var locationName = $("#addLocationName").val();
    var capitalizedLocationName = locationName.charAt(0).toUpperCase() + locationName.slice(1);

    // Send the capitalized location name to insertLocation.php using an AJAX request
    $.ajax({
        url: "./libs/php/insertLocation.php",
        type: "POST",
        dataType: "json",
        data: {
            name: capitalizedLocationName
        },
        success: function (result) {
            if (result.status.code === "200") {
                
                $("#addLocationModal").modal("hide");
                $("#resultAddLocationModal").modal("show");
                populateLocationTable(); // Refresh the location table
            } else {
                $("#addLocationResult").text("Sorry, there was an issue adding the location. Please try again.");
                $("#addLocationModal").modal("hide");
                $("#resultAddLocationModal").modal("show");
                populateLocationTable();
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX call failed: " + textStatus);
        }
    });
    

});



$("#editLocationModal").on("show.bs.modal", function (e) {


    var locationID = $(e.relatedTarget).data("id");
    $.ajax({
        url: "./libs/php/getLocationByID.php",
        type: "POST",
        dataType: "json",
        data: {
            id: locationID
        },
        success: function (result) {
            if (result.status.code === "200") {
                var location = result.data[0];
                $("#editLocationID").val(location.id);
                $("#editLocationName").val(location.name);
            } else {
                alert("Error: " + result.status.description);
            }
        }
        })

});

$("#editLocationModal").on("hidden.bs.modal", function () {
    // Reset all fields to their default values
    $("#editLocationForm")[0].reset();
});

$("#editLocationForm").on("submit", function (e) {
   
    e.preventDefault();

    var locationID = $("#editLocationID").val();
    var name = $("#editLocationName").val();
    
   

    $.ajax({
        url: "./libs/php/editLocation.php",
        type: "POST",
        dataType: "json",
        data: {
            id: locationID,
            name: name,
        },
        success: function (result) {
            if (result.status.code === "200") {
                
                $("#editLocationModal").modal("hide");
                $("#resultEditLocationModal").modal("show");
                populateLocationTable(); // Refresh the table
            } else {
                $("#editLocationResult").text("Sorry, there was an issue editing the location. Please try again.");
                $("#editLocationModal").modal("hide");
                $("#resultEditLocationModal").modal("show");
                populateLocationTable();
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX call failed: " + textStatus);
        }
    });

});

$(document).on("click", ".deleteLocationBtn", function () {
    console.log("Delete button clicked");
    dataId=$(this).data("id");
    $("#deleteLocationID").val(dataId);
    console.log(dataId);
    checkLocation(dataId);
});




$("#deleteLocationModalBtn").on("click", function (e) {
    e.preventDefault();

   

    $.ajax({
        url: "./libs/php/deleteLocationByID.php",
        type: "POST",
        dataType: "json",
        data: {
            id: $("#deleteLocationID").val()  
        },
        success: function (result) {
            if (result.status.code === "200") {
                
                $("#deleteLocationModal").modal("hide");
                $("#resultDeleteLocationModal").modal("show");
                populateLocationTable(); // Refresh the table
            } else {
                $("#deleteLocationResult").text("Sorry, there was an issue deleting the location. Please try again.");
                $("#deleteLocationModal").modal("hide");
                $("#resultDeleteLocationModal").modal("show");
                populateLocationTable();
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX call failed: " + textStatus);
        }
    })

});


//------------------INITIALIZATION---------------------


$(document).ready(function () {
    // Make an AJAX call to getAll.php
    populatePersonnelTable();
    populateDepartmentTable();
    populateLocationTable();
});
  

//-----------------------------------------------------------------
//FUNCTIONS
//-----------------------------------------------------------------

function populateDepartmentTable() {
    $.ajax({
        url: "./libs/php/getAllDepartments.php",
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response.status.code === "200") {
                var departments = response.data;

                // Create a document fragment
                var frag = document.createDocumentFragment();

                // Populate the fragment with department rows
                departments.forEach(function (department) {
                    var row = document.createElement("tr");

                    var departmentName = document.createElement("td");
                    departmentName.classList.add("align-middle", "text-nowrap", "department");
                    departmentName.textContent = department.departmentName;
                    row.appendChild(departmentName);

                    var locationName = document.createElement("td");
                    locationName.classList.add("align-middle", "text-nowrap", "d-none", "d-md-table-cell", "location");
                    locationName.textContent = department.locationName;
                    row.appendChild(locationName);

                    var actions = document.createElement("td");
                    actions.classList.add("align-middle", "text-end", "text-nowrap");

                    var editButton = document.createElement("button");
                    editButton.type = "button";
                    editButton.classList.add("btn", "btn-primary", "btn-sm", "me-2");
                    editButton.setAttribute("data-bs-toggle", "modal");
                    editButton.setAttribute("data-bs-target", "#editDepartmentModal");
                    editButton.setAttribute("data-id", department.id);
                    editButton.innerHTML = '<i class="fas fa-pencil-alt fa-fw"></i>';
                    actions.appendChild(editButton);

                    var deleteButton = document.createElement("button");
                    deleteButton.type = "button";
                    deleteButton.classList.add("btn", "btn-primary", "btn-sm", "deleteDepartmentBtn");
                    deleteButton.setAttribute("data-id", department.id);
                    deleteButton.innerHTML = '<i class="fas fa-trash fa-fw"></i>';
                    actions.appendChild(deleteButton);

                    row.appendChild(actions);

                    frag.appendChild(row);
                });

                // Clear the table body and append the fragment
                $("#departmentTableBody").empty().append(frag);
            } else {
                alert("Error: Unable to fetch department data.");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX call failed: " + textStatus);
        }
    });
}

function populatePersonnelTable() {
    $.ajax({
        url: "./libs/php/getAll.php",
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response.status.code === "200") {
                var personnel = response.data;

                // Create a document fragment
                var frag = document.createDocumentFragment();

                // Populate the fragment with personnel rows
                personnel.forEach(function (item) {
                    var row = document.createElement("tr");

                    var id = document.createElement("td");
                    id.classList.add("id");
                    id.style.display = "none";
                    id.textContent = item.id;
                    row.appendChild(id);

                    var concatName = document.createElement("td");
                    concatName.classList.add("concatName");
                    concatName.textContent = `${item.lastName}, ${item.firstName}`;
                    row.appendChild(concatName);

                    var jobTitle = document.createElement("td");
                    jobTitle.classList.add("jobTitle");
                    jobTitle.textContent = item.jobTitle;
                    row.appendChild(jobTitle);

                    var email = document.createElement("td");
                    email.classList.add("email");
                    email.textContent = item.email;
                    row.appendChild(email);

                    var department = document.createElement("td");
                    department.classList.add("department");
                    department.textContent = item.department;
                    row.appendChild(department);

                    var location = document.createElement("td");
                    location.classList.add("location");
                    location.textContent = item.location;
                    row.appendChild(location);

                    var actions = document.createElement("td");
                    actions.classList.add("text-end", "text-nowrap");

                    var editButton = document.createElement("button");
                    editButton.type = "button";
                    editButton.classList.add("btn", "btn-primary", "btn-sm","me-2");
                    editButton.setAttribute("data-bs-toggle", "modal");
                    editButton.setAttribute("data-bs-target", "#editPersonnelModal");
                    editButton.setAttribute("data-id", item.id);
                    editButton.innerHTML = '<i class="fas fa-pencil-alt fa-fw"></i>';
                    actions.appendChild(editButton);

                    var deleteButton = document.createElement("button");
                    deleteButton.type = "button";
                    deleteButton.classList.add("btn", "btn-primary", "btn-sm", "deletePersonnelBtn");
                    deleteButton.setAttribute("data-bs-toggle", "modal");
                    deleteButton.setAttribute("data-bs-target", "#deletePersonnelModal");
                    deleteButton.setAttribute("data-id", item.id);
                    deleteButton.innerHTML = '<i class="fas fa-trash fa-fw"></i>';
                    actions.appendChild(deleteButton);

                    row.appendChild(actions);

                    frag.appendChild(row);
                });

                // Clear the table body and append the fragment
                $("#personnelTableBody").empty().append(frag);
            } else {
                alert("Error: " + response.status.description);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX call failed: " + textStatus);
        }
    });
}

function populateLocationTable() {
    $.ajax({
        url: "./libs/php/getAllLocations.php",
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response.status.code === "200") {
                var locations = response.data;

                // Create a document fragment
                var frag = document.createDocumentFragment();

                // Populate the fragment with location rows
                locations.forEach(function (location) {
                    var row = document.createElement("tr");

                    var locationName = document.createElement("td");
                    locationName.classList.add("location");
                    locationName.textContent = location.name;
                    row.appendChild(locationName);

                    var actions = document.createElement("td");
                    actions.classList.add("text-end", "text-nowrap");

                    var editButton = document.createElement("button");
                    editButton.type = "button";
                    editButton.classList.add("btn", "btn-primary", "btn-sm", "me-2");
                    editButton.setAttribute("data-bs-toggle", "modal");
                    editButton.setAttribute("data-bs-target", "#editLocationModal");
                    editButton.setAttribute("data-id", location.id);
                    editButton.innerHTML = '<i class="fas fa-pencil-alt fa-fw"></i>';
                    actions.appendChild(editButton);

                    var deleteButton = document.createElement("button");
                    deleteButton.type = "button";
                    deleteButton.classList.add("btn", "btn-primary", "btn-sm", "deleteLocationBtn");
                    deleteButton.setAttribute("data-id", location.id);
                    deleteButton.innerHTML = '<i class="fas fa-trash fa-fw"></i>';
                    actions.appendChild(deleteButton);

                    row.appendChild(actions);

                    frag.appendChild(row);
                });

                // Clear the table body and append the fragment
                $("#locationTableBody").empty().append(frag);
            } else {
                alert("Error: " + response.status.description);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX call failed: " + textStatus);
        }
    });
}

function searchTables(query) {
    $("table tbody tr").each(function () {
        var row = $(this);
        var match = false;

        // Iterate through all cells in the row
        row.find("td").each(function () {
            var cell = $(this);
            if (cell.text().toLowerCase().indexOf(query) !== -1) {
                match = true;
                return false; // Break the loop if a match is found
            }
        });

        // Show or hide the row based on the match
        if (match) {
            row.show();
        } else {
            row.hide();
        }
    });
};

function filterTables() {
    var department = $("#filterDepartment").val();
    var location = $("#filterLocation").val();
   

    $("table tbody tr").each(function () {
        var row = $(this);
        var match = true;

        if (department && department !== "" && row.find(".department").text() !== department) {
            match = false;
        }

        if (location && location !== "" && row.find(".location").text() !== location) {
            match = false;
        }

        if (match) {
            row.show();
        } else {
            row.hide();
        }
    });
};


function populateFilterDropdowns() {
    $.ajax({
        url: "./libs/php/getAll.php",
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response.status.code === "200") {
                var departments = new Set();
                var locations = new Set();
               

                response.data.forEach(function (item) {
                    departments.add(item.department);
                    locations.add(item.location);
                    
                });

                // Populate department dropdown
                $("#filterDepartment").empty().append('<option value="">Select Department</option>');
                departments.forEach(function (department) {
                    $("#filterDepartment").append('<option value="' + department + '">' + department + '</option>');
                });

                // Populate location dropdown
                $("#filterLocation").empty().append('<option value="">Select Location</option>');
                locations.forEach(function (location) {
                    $("#filterLocation").append('<option value="' + location + '">' + location + '</option>');
                });

                
              
            } else {
                alert("Error: Unable to fetch data.");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX call failed: " + textStatus);
        }
    });
};

function updateFilterOptions()  {
    var selectedDepartment = $("#filterDepartment").val();
    var selectedLocation = $("#filterLocation").val();
   

    $.ajax({
        url: "./libs/php/getAll.php",
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response.status.code === "200") {
                var departments = new Set();
                var locations = new Set();
               

                response.data.forEach(function (item) {
                    if ((selectedDepartment === "" || item.department === selectedDepartment) &&
                        (selectedLocation === "" || item.location === selectedLocation) ) {
                        departments.add(item.department);
                        locations.add(item.location);
                        
                    }
                });

                // Update department dropdown
                $("#filterDepartment").empty().append('<option value="">Select Department</option>');
                departments.forEach(function (department) {
                    $("#filterDepartment").append('<option value="' + department + '">' + department + '</option>');
                });

                // Update location dropdown
                $("#filterLocation").empty().append('<option value="">Select Location</option>');
                locations.forEach(function (location) {
                    $("#filterLocation").append('<option value="' + location + '">' + location + '</option>');
                });

              
               

                // Restore selected values
                $("#filterDepartment").val(selectedDepartment);
                $("#filterLocation").val(selectedLocation);
                
                if (selectedDepartment !== "") {
                    var firstLocationValue = $("#filterLocation option:eq(1)").val(); // Get the value of the first option (excluding the default)
                    if (firstLocationValue) {
                        $("#filterLocation").val(firstLocationValue); // Set the location dropdown to the first value
                    }
                } 
                else {
                    $("#filterLocation").val(selectedLocation);
                }

            } else {
                alert("Error: Unable to fetch data.");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX call failed: " + textStatus);
        }
    });
};

function populateDeletePersonnelName(personnelID) {
    
    $.ajax({
        url: "./libs/php/getPersonnelByID.php",
        type: "POST",
        dataType: "json",
        data: {
            id: personnelID
        },
        success: function (result) {
            if (result.status.code === "200") {
                var firstName = result.data.personnel[0].firstName;
                var lastName = result.data.personnel[0].lastName;
                $("#deletePersonnelName").text(firstName + " " + lastName);
            } else {
                $("#deletePersonnelName").text("Error retrieving data");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $("#deletePersonnelName").text("Error retrieving data");
        }
    });
};



function populateDeleteLocationName(locationID) {
    
    $.ajax({
        url: "./libs/php/getLocationByID.php",
        type: "POST",
        dataType: "json",
        data: {
            id: locationID
        },
        success: function (result) {
            if (result.status.code === "200") {
               
                $("#deleteLocationName").text(result.data[0].name);
            } else {
                $("#deleteLocationName").text("Error retrieving data");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $("#deleteLocationName").text("Error retrieving data");
        }
    });
};

function populateLocationDropdown(callback) {
    $.ajax({
        url: "./libs/php/getAllLocations.php",
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response.status.code === "200") {
                const dropdowns = ["#addDepartmentLocation", "#editDepartmentLocation"];
                dropdowns.forEach(function (dropdown) {
                    $(dropdown).empty();
                    $(dropdown).append('<option value="" selected>Select Location</option>');

                    // Assuming response.data contains an array of locations
                    response.data.forEach(function (item) {
                        $(dropdown).append(
                            $("<option>", {
                                value: item.id, // Assuming locationID is the identifier
                                text: item.name // Assuming location is the name
                            })
                        );
                    });
                });
                if (callback) callback();
            } else {
                alert("Error: Unable to fetch data.");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX call failed: " + textStatus);
        }
    });
};

function sortTable(table, column, order) {
    var rows = table.find('tbody > tr').get();
    rows.sort(function (a, b) {
        var A = $(a).find('td').eq(column).text().toUpperCase();
        var B = $(b).find('td').eq(column).text().toUpperCase();

        if (A < B) {
            return order === 'asc' ? -1 : 1;
        }
        if (A > B) {
            return order === 'asc' ? 1 : -1;
        }
        return 0;
    });

    $.each(rows, function (index, row) {
        table.children('tbody').append(row);
    });
}

function checkDepartment(dataId) {

   console.log(dataId);
    $.ajax({
        url: "./libs/php/checkDepartment.php",
        type: "POST",
        dataType: "json",
        data: {
          id: dataId
        },
        success: function (result) {
          if (result.status.code == 200) {
            if (result.data[0].personnelCount == 0) {
              $("#deleteDepartmentName").text(result.data[0].departmentName);
    
              $("#deleteDepartmentModal").modal("show");
            } else {
              $("#cannotDeleteDepartmentName").text(result.data[0].departmentName);
              $("#cannotDeleteDepartmentCount").text(result.data[0].personnelCount);
    
              $("#cannotDeleteDepartmentModal").modal("show");
            }
          } else {
            $("#deleteDepartmentModal .modal-title").replaceWith("Error retrieving data");
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          $("#deleteDepartmentModal .modal-title").replaceWith("Error retrieving data");
        }
      });
    };

 function checkLocation(dataId) {

        
         $.ajax({
             url: "./libs/php/checkLocation.php",
             type: "POST",
             dataType: "json",
             data: {
               id: dataId
             },
             success: function (result) {
               if (result.status.code == 200) {
                 if (result.data[0].departmentCount == 0) {
                   $("#deleteLocationName").text(result.data[0].locationName);
         
                   $("#deleteLocationModal").modal("show");
                 } else {
                   $("#cannotDeleteLocationName").text(result.data[0].locationName);
                   $("#cannotDeleteLocationCount").text(result.data[0].departmentCount);
                    
                   $("#cannotDeleteLocationModal").modal("show");
                 }
               } else {
                 $("#deleteLocationModal .modal-title").replaceWith("Error retrieving data");
               }
             },
             error: function (jqXHR, textStatus, errorThrown) {
               $("#deleteLocationModal .modal-title").replaceWith("Error retrieving data");
             }
           });
         };