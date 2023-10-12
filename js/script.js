// start our animation library AOS
AOS.init();

// declare elements
const nav = document.getElementById("nav");

const mobileFilterButton = document.getElementById("mobile-dropdown-btn");
const hamburger = document.getElementById("hamburger");
const aside = document.getElementById("aside");
const desktopFilterButton = document.getElementById("filter-icon");
const filterContent = document.getElementById("filter-content");

const statusMessage = document.getElementById("status-message");
const contentBox = document.getElementById("result-content");

// mobile dropdown
function toggleMobileDropdown() {
    aside.classList.toggle("active");
    hamburger.classList.toggle("bi-list");
    hamburger.classList.toggle("bi-x");
    nav.classList.toggle("mobile-dropdown");
}

mobileFilterButton.addEventListener("click", function() {
    toggleMobileDropdown();
})

// desktop sidebar
function toggleDesktopSidebar() {
    filterContent.classList.toggle("active");
    desktopFilterButton.classList.toggle("bi-funnel");
    desktopFilterButton.classList.toggle("bi-funnel-fill");
}

desktopFilterButton.addEventListener("click", function() {
    toggleDesktopSidebar()
})

// Data Elements and other things

window.onload = ()=>renderFilter(locations);

function renderFilter(selected) {
    contentBox.innerHTML = ``
    for (let i = 0; i < selected.length; i++) {
        contentBox.innerHTML += `
        <div class="location-card" data-aos="fade-up" data-aos-delay="${(i + 1) * 50}">
            <div>
                <img src="${selected[i].imageUrl}" alt="${selected[i].imageAlt}">
            </div>
            <div class="location-card-details">
                <h2 class="card-title">${selected[i].title}</h2>
                <p class="card-location"><i>${selected[i].location}</i></p>
                <p class="card-price"><strong>$${selected[i].price} NZD</strong><i> per night</i></p>
                <p class="card-rating"><strong><i class="bi bi-star-fill"></i>${selected[i].rating}/10</strong></p>
                <div class="card-showmore-div"><button data-id="${selected[i].id}" class="showmore-button">Show more</button></div>
            </div>
        </div>
        `;
    }
    addEventsShowmore(selected);
    createMapMarkers(selected);
}


// Filters

// Sorting
const sortMethods = document.getElementsByName("sort");
let selected = locations;

for (let sortIndex = 0; sortIndex < sortMethods.length; sortIndex++) {
    sortMethods[sortIndex].addEventListener('change', function () {
        if (selected != null) {
            removeStatusMessage()
            startSort(selected);
            for (let item of categories)
                item.checked = false;
                const searchBar = document.getElementById('search-input');
                searchBar.value = '';
        } else {
            let errorMessage = "No sort option selected."
            addStatusMessage()
            return;
        }
    });
}

function startSort(selected) {
    const sortMethod = document.querySelector('input[type="radio"]:checked');
    console.log(sortMethod);

    if (sortMethod) {
        const activeSort = sortMethod.value;

        if (activeSort === "id") {
            selected.sort((a, b) => a.id - b.id);
            console.log(selected);
        } else if (activeSort === "name") {
            selected.sort((a, b) => a.title.localeCompare(b.title));
            console.log(selected);
        } else if (activeSort === "rating") {
            selected.sort((a, b) => b.rating - a.rating);
            console.log(selected);
        } else if (activeSort === "price") {
            selected.sort((a, b) => a.price - b.price);
            console.log(selected);
        } else {
            removeStatusMessage()
        }
    } else {
        let errorMessage = "No sort method selected."
        addStatusMessage(errorMessage)
    }
    renderFilter(selected)
}

// Categories
const categories = document.getElementsByName("category");

for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
    categories[categoryIndex].addEventListener("change", function() {
        removeStatusMessage()
        filterLocations()
    })
}

function filterLocations() {
    let checkedCategories = document.querySelectorAll("input[type=checkbox]:checked");
    
    if (checkedCategories.length === 0) {
        renderFilter(locations)
        return;
    }
    // declare an array, this array will be filled with categories which the user has selected.
    let selectedCategories = [];
    for (let i = 0; i < checkedCategories.length; i++) {
        selectedCategories.push(checkedCategories[i].value)
    };
    console.log(selectedCategories);
    filterBySelectedCategory(selectedCategories);
};

function filterBySelectedCategory(categories) {
    let selectedLocations = []
    for (let i = 0; i < categories.length; i++) {
        let category = categories[i]

        for (let index = 0; index < locations.length; index++) {
            let location = locations[index]

            if (location.categories.includes(category) && !selectedLocations.includes(location)) {
                selectedLocations.push(location)
            }
        }
    }
    renderFilter(selectedLocations)
}

// Search Bar
const searchBtn = document.getElementById("submit-search");

searchBtn.addEventListener("click", function() {
    event.preventDefault();
    removeStatusMessage()
    let userSearch = filterBySearch();
    renderFilter(userSearch);
})

function filterBySearch() {
    let searchInput = document.getElementById("search-input")
    let validLocations = []
    for (let i = 0; i < locations.length; i++) {
        let currentLocation = locations[i];
        let lowercaseSearchInput = searchInput.value.toLowerCase()
        
        if (currentLocation.title.toLowerCase().match(lowercaseSearchInput)) {
            validLocations.push(currentLocation)
        }
    }
    if (validLocations.length === 1) {
        errorMessage = "Search returned " + validLocations.length + " result.";
        addStatusMessage(errorMessage)
    } else {
        errorMessage = "Search returned " + validLocations.length + " results.";
        addStatusMessage(errorMessage)
    }
    console.log(validLocations);
    return validLocations;
}

// Showmore modal Stuff
const modal = document.getElementById("modal");
const modalWrapper = document.getElementById("modal-wrapper");
const modalResult = document.getElementById("modal-result");
const modalCloseBtn = document.getElementById("modal-close");

function closeModal() {
    modalWrapper.classList.remove("active");
    // console.log("Modal Wrapper closed!");
}

modalCloseBtn.addEventListener("click", function() {
    modalResult.innerHTML = ``
    closeModal()
})

function openModal(content) {
    modalResult.innerHTML = `
    <h2>${content.title}</h2>
    <p class="modal-location">${content.location}</p>
    <br><div class="modal-price-rating">
        <p class="modal-price"><strong>$${content.price} NZD</strong><i> per night</i></p>
        <p class="modal-rating"><strong><i class="bi bi-star-fill"></i>${content.rating}/10</strong></p>
    </div><br>
    <p>${content.description}</p>
    <div id="categories-wrapper"></div>
    `
    let categoryWrapper = document.getElementById("categories-wrapper");

    for (let item of content.categories) {
        categoryWrapper.innerHTML += `<span class="modal-categories">${item}</span>`;
    }

    modalWrapper.classList.toggle("active");
    
    map.flyTo({
        center: content.coords,
        zoom: 12,
        duration: 2500,
        essential: true
    })
}

// Add Showmore button event listeners

function addEventsShowmore(selected) {
    const showmoreBtns = document.getElementsByClassName("showmore-button");

    for (let i = 0; i < showmoreBtns.length; i++) {
        showmoreBtns[i].addEventListener("click", function () {
            let currentId = showmoreBtns[i].dataset.id;
            
            for (let index = 0; index < selected.length; index++) {
                console.log(selected[index].id);
                if (currentId == selected[index].id) {
                    let modalContent = selected[index];
                    openModal(modalContent);
                }

            }
        });
    }
}

addEventsShowmore(locations)

// Map Box
mapboxgl.accessToken = 'pk.eyJ1Ijoic3Vkc2VsbCIsImEiOiJjbGkyYXZuNnQxM245M2Ntdmo0N29wbWswIn0.Ux3-Lz8tBH5LGWJBz53egA';

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: [173.154931, -41.745629], // starting position [lng, lat]
    zoom: 5, // starting zoom
});

function createMapMarkers(selected) {
    let markers = document.querySelectorAll('.marker')
    for (let marker of markers) {
        marker.parentNode.removeChild(marker)
    }
    for (let item of selected) {
        let el = document.createElement('div');
        el.className = 'marker';
        el.innerHTML = `
        <p class="map-marker-text">${item.title}</p><br>
        <i class="bi bi-geo-alt-fill map-marker"></i>
        `;
    
        new mapboxgl.Marker(el)
        .setLngLat(item.coords)
        .addTo(map);
    }
}

function removeStatusMessage() {
    statusMessage.classList.remove("active");
    statusMessage.innerHTML = ``;
}

function addStatusMessage(error) {
    statusMessage.classList.add("active");
    statusMessage.innerHTML = error;
}