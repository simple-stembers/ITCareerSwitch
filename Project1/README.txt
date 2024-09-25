This is a project designed to utilise API calls with ajax, and a modal overlay on top of a leaflet map.

The main functionality:
  -Map starts where user is located
  -Clicked points on the map should trigger a modal overlay, which should tell you:
    +general demographics
    +show the flag
    +the local area and points of interest
    +the local currency
    +ability to exchange local currency (currently just sterling, but very easy to adjust to make it chooseable)
    +wikipedia page of the country for further information
  -Clicked point should zoom smoothly to the point clicked, to enable easier view of the local POIs

Known current issues:
  -The nav menu not usable.
    +This will be fixed once I have finished the website the page is situated
  -If a new modal menu is opened quickly after one is closed when on a mobile device, the modal menu transforms to be 100% further to the right
    +I believe this may be fixed in the current build, but more testing may reveal it still exists.
  -The exchange rate api has run out of monthly credits
    +This is unfortunate, but has only occurred due to me not thinking about disabling the API calls whilst testing other APIs. This is extremely unlikely to occur since the main testing is finished.

Thanks for checking out the project! It is currently hosted at https://sdchambers.co.uk/project1/index.html if you'd like to visit it!
