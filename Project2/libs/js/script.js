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
    
    populateFilterDropdowns();

    $("#filterModal").modal("show");
    
});

$("#filterDepartment").change(updateFilterOptions);
$("#filterLocation").change(updateFilterOptions);
$("#filterJobTitle").change(updateFilterOptions);

$("#applyFilters").click(function () {
    filterTables();
    $("#filterModal").modal("hide");
})
  
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
    
    populatePersonnelTable();
    
});
  
$("#departmentsBtn").click(function () {
    
    populateDepartmentTable();
    
});
  
$("#locationsBtn").click(function () {
    
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
                            text: this.name
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
                alert("Personnel added successfully!");
                $("#addPersonnelModal").modal("hide");
                populatePersonnelTable();
            } else {
                alert("Error: " + result.status.description);
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
                alert("Personnel updated successfully!");
                $("#editPersonnelModal").modal("hide");
                populatePersonnelTable(); // Refresh the table
            } else {
                alert("Error: " + result.status.description);
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

  $("#deletePersonnelForm").on("submit", function (e) {
    e.preventDefault();

        var confirmation = $("#deletePersonnelConfirmation").val().toLowerCase();
        var personnelID = $("#deletePersonnelID").val();
        

        if (confirmation !== "delete") {
            alert("Please type 'delete' to confirm.");
            return;
        }

        $.ajax({
            url: "./libs/php/deletePersonnelByID.php",
            type: "POST",
            dataType: "json",
            data: {
                id: personnelID
            },
            success: function (result) {
                if (result.status.code === "200") {
                    alert("Personnel deleted successfully!");
                    $("#deletePersonnelModal").modal("hide");
                    populatePersonnelTable(); 
                } else {
                    alert("Error: " + result.status.description);
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
                alert("Department added successfully!");
                populateDepartmentTable();
                // Refresh the department table or update the UI as needed
            } else {
                alert("Error adding department: " + result.status.description);
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
                alert("Department updated successfully!");
                $("#editDepartmentModal").modal("hide");
                populateDepartmentTable(); // Refresh the table
            } else {
                alert("Error: " + result.status.description);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX call failed: " + textStatus);
        }
    });

});

$("#deleteDepartmentModal").on("show.bs.modal", function (e) {
    var departmentID = $(e.relatedTarget).data("id");
    $("#deleteDepartmentID").val(departmentID);
    populateDeleteDepartmentName(departmentID);
});

$("#deleteDepartmentForm").on("submit", function (e) {
    e.preventDefault();

    var confirmation = $("#deleteDepartmentConfirmation").val().toLowerCase();

    if (confirmation !== "delete") {
        alert("Please type 'delete' to confirm.");
        return;
    }   

    $.ajax({
        url: "./libs/php/deleteDepartmentByID.php",
        type: "POST",
        dataType: "json",
        data: {
            id: $("#deleteDepartmentID").val()  
        },
        success: function (result) {
            if (result.status.code === "200") {
                alert("Department deleted successfully!");
                $("#deleteDepartmentModal").modal("hide");
                populateDepartmentTable(); // Refresh the table
            } else {
                alert("Error: " + result.status.description);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX call failed: " + textStatus);
        }
        });
});


//------------LOCATION LISTENERS---------------------


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
                alert("Location added successfully!");
                $("#addLocationModal").modal("hide");
                populateLocationTable(); // Refresh the location table
            } else {
                alert("Error: " + result.status.description);
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
                alert("Location updated successfully!");
                $("#editLocationModal").modal("hide");
                populateLocationTable(); // Refresh the table
            } else {
                alert("Error: " + result.status.description);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX call failed: " + textStatus);
        }
    });

});

$("#deleteLocationModal").on("show.bs.modal", function (e) {
    var locationID = $(e.relatedTarget).data("id");
    $("#deleteLocationID").val(locationID);
    populateDeleteLocationName(locationID);
});

$("#deleteLocationForm").on("submit", function (e) {
    e.preventDefault();

    var confirmation = $("#deleteLocationConfirmation").val().toLowerCase();    

    if (confirmation !== "delete") {
        alert("Please type 'delete' to confirm.");
        return;
    }   

    $.ajax({
        url: "./libs/php/deleteLocationByID.php",
        type: "POST",
        dataType: "json",
        data: {
            id: $("#deleteLocationID").val()  
        },
        success: function (result) {
            if (result.status.code === "200") {
                alert("Location deleted successfully!");
                $("#deleteLocationModal").modal("hide");
                populateLocationTable(); // Refresh the table
            } else {
                alert("Error: " + result.status.description);
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
    $.when(
        $.ajax({
            url: "./libs/php/getAllDepartments.php",
            type: "GET",
            dataType: "json"
        }),
        $.ajax({
            url: "./libs/php/getAllLocations.php",
            type: "GET",
            dataType: "json"
        })
    ).done(function (departmentsResponse, locationsResponse) {
        if (departmentsResponse[0].status.code === "200" && locationsResponse[0].status.code === "200") {
            var departments = departmentsResponse[0].data;
            var locations = locationsResponse[0].data;

            // Create a map of location IDs to location names
            var locationMap = {};
            locations.forEach(function (location) {
                locationMap[location.id] = location.name;
            });

            // Clear the table body
            $("#departmentTableBody").empty();

            // Populate the table with departments and their corresponding locations
            departments.forEach(function (department) {
                var row = `<tr>
                    <td class="align-middle text-nowrap department">${department.name}</td>
                    <td class="align-middle text-nowrap d-none d-md-table-cell location">${locationMap[department.locationID]}</td>
                    <td class="align-middle text-end text-nowrap">
                        <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.id}">
                        <i class="fas fa-pencil-alt fa-fw"></i>
                        </button>
                        <button type="button" class="btn btn-primary btn-sm deleteDepartmentBtn" data-bs-toggle="modal" data-bs-target="#deleteDepartmentModal" data-id="${department.id}">
                        <i class="fas fa-trash fa-fw"></i>
                        </button>
                    </td>
                </tr>`;
                $("#departmentTableBody").append(row);
                
            });
        } else {
            alert("Error: Unable to fetch department or location data.");
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert("AJAX call failed: " + textStatus);
    });
};

function populatePersonnelTable() {
    $.ajax({
        url: "./libs/php/getAll.php",
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response.status.code === "200") {
                // Clear the table body
                $("#personnelTableBody").empty();

                // Iterate over the data array and append rows to the table
                response.data.forEach(function (item) {
                    var row = `<tr>
                        <td class="id" style="display:none;">${item.id}</td>
                        <td class="lastName">${item.lastName}</td>
                        <td class="firstName">${item.firstName}</td>
                        <td class="jobTitle">${item.jobTitle}</td>
                        <td class="email">${item.email}</td>
                        <td class="department">${item.department}</td>
                        <td class="location">${item.location}</td>
                        <td class="text-end text-nowrap">
                        <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${item.id}">
                        <i class="fas fa-pencil-alt fa-fw"></i>
                        </button>
                        <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deletePersonnelModal" data-id="${item.id}">
                        <i class="fas fa-trash fa-fw"></i>
                        </button>
                        </td>
                    </tr>`;
                    $("#personnelTableBody").append(row);
                    console.log()
                });
            } else {
                alert("Error: " + response.status.description);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX call failed: " + textStatus);
        }
    });
};

function populateLocationTable()    {
    $.ajax({
        url: "./libs/php/getAllLocations.php",
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response.status.code === "200") {
                // Clear the table body
                $("#locationTableBody").empty();

                // Iterate over the data array and append rows to the table
                response.data.forEach(function (item) {
                    var row = `<tr>
                        <td class="location">${item.name}</td>
                        <td class="text-end text-nowrap">
                        <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${item.id}">
                        <i class="fas fa-pencil-alt fa-fw"></i>
                        </button>
                        <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteLocationModal" data-id="${item.id}">
                        <i class="fas fa-trash fa-fw"></i>
                        </button>
                        </td>
                    </tr>`;
                    $("#locationTableBody").append(row);
                });
            } else {
                alert("Error: " + response.status.description);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("AJAX call failed: " + textStatus);
        }
    });
};

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
    var jobTitle = $("#filterJobTitle").val();

    $("table tbody tr").each(function () {
        var row = $(this);
        var match = true;

        if (department && department !== "" && row.find(".department").text() !== department) {
            match = false;
        }

        if (location && location !== "" && row.find(".location").text() !== location) {
            match = false;
        }

        if (jobTitle && jobTitle !== "" && row.find(".jobTitle").text() !== jobTitle) {
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
                var jobTitles = new Set();

                response.data.forEach(function (item) {
                    departments.add(item.department);
                    locations.add(item.location);
                    jobTitles.add(item.jobTitle);
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

                // Populate job title dropdown
                $("#filterJobTitle").empty().append('<option value="">Select Job Title</option>');
                jobTitles.forEach(function (jobTitle) {
                    $("#filterJobTitle").append('<option value="' + jobTitle + '">' + jobTitle + '</option>');
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
    var selectedJobTitle = $("#filterJobTitle").val();

    $.ajax({
        url: "./libs/php/getAll.php",
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response.status.code === "200") {
                var departments = new Set();
                var locations = new Set();
                var jobTitles = new Set();

                response.data.forEach(function (item) {
                    if ((selectedDepartment === "" || item.department === selectedDepartment) &&
                        (selectedLocation === "" || item.location === selectedLocation) &&
                        (selectedJobTitle === "" || item.jobTitle === selectedJobTitle)) {
                        departments.add(item.department);
                        locations.add(item.location);
                        jobTitles.add(item.jobTitle);
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

                // Update job title dropdown
                $("#filterJobTitle").empty().append('<option value="">Select Job Title</option>');
                jobTitles.forEach(function (jobTitle) {
                    $("#filterJobTitle").append('<option value="' + jobTitle + '">' + jobTitle + '</option>');
                });

                // Restore selected values
                $("#filterDepartment").val(selectedDepartment);
                $("#filterLocation").val(selectedLocation);
                $("#filterJobTitle").val(selectedJobTitle);
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

function populateDeleteDepartmentName(departmentID) {
    
    $.ajax({
        url: "./libs/php/getDepartmentByID.php",
        type: "POST",
        dataType: "json",
        data: {
            id: departmentID
        },
        success: function (result) {
            if (result.status.code === "200") {
               
                $("#deleteDepartmentName").text(result.data[0].name);
            } else {
                $("#deleteDepartmentName").text("Error retrieving data");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $("#deleteDepartmentName").text("Error retrieving data");
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