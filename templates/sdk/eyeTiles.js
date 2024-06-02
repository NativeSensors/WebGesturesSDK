
// function load_eyegesturesAPI()
// {
//     // Create a new script element
//     var eyegesturesScript = document.createElement('script');
//     // Set the source attribute to the URL of the eyegestures.js script
//     eyegesturesScript.src = '/eyegestures.js';
//     // Append the script element to the HTML document
//     document.head.appendChild(eyegesturesScript);
// }

function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

var eyeTilesRun = true;
function EyeMagnetStop(){
    eyeTilesRun = false;
}

function EyeMagnetStart(){
    eyeTilesRun = true;
}

function EyeTilesAPI(API_KEY, cols_list, options = {})
{
    const {
        fix_point = 0.1,
        freeze_radius = 500,
        sightGrid = true,
        sightGridColor = "#f89c3241",
        onTile = function(id,fix,blink){ console.log("id: ", id, " fix: ", fix, " blink: ", blink) },
        display_width  = document.body.clientWidth - 75,
        display_height = document.body.clientHeight - 75,
        onCalibration = null,
        calibration = true,
    } = options;

    // generate tiles
    const tiles_list = [];
    document.addEventListener("DOMContentLoaded", function() {
    
        // Number of rows and columns
        var counter = 1;
        var numCols = cols_list.length;
        var i = 1;
        // const numRows = 2;
        // const numColumns = 2;
      
        // gridContainer.classList.add('card__grid-effect');
        // Loop through rows
        var col_width_prcnt = 100/numCols;
        
        cols_list.forEach((numRows) => {
          // Create row container
          const colContainer = document.createElement('div');
          colContainer.classList.add('container_col');
          colContainer.style.width = `${col_width_prcnt}%`;
          colContainer.style.height = `100%`;
          var row_height_prcnt = 100/numRows; 
          
          if(i == 1)
          {
            colContainer.style.marginLeft = "0px";
          }
          else if(i == numCols)
          {
            colContainer.style.marginRight = "0px";
          }
    
          // Loop through columns                
          for (let j = 1; j <= numRows; j++) {
             // Create tile
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.id = `tile_${counter}`;
            tile.style.height = `${row_height_prcnt}%`;
                    
            if(j == 1)
            {
                tile.style.marginTop = "0px";
            }
            
            if(j == numRows)
            {
                tile.style.marginBottom = "0px";
            }
      
            // Append tile to row container
            tiles_list.push(tile);
            colContainer.appendChild(tile);
            counter += 1;
          }     
          
          // Append row container to grid container
          if(sightGrid){
            // Get the container element
            const gridContainer = document.getElementById('grid_container');
            gridContainer.style.width = "100vw";
            gridContainer.style.height = "100vh";
            gridContainer.style.display = "flex";
            gridContainer.style.position = "absolute";
            gridContainer.appendChild(colContainer);
          }
          i += 1;
        });
      
        // Append grid container to the document body or any other desired parent element
    });
    
    if(sightGrid)
    {
        document.addEventListener("DOMContentLoaded", function() {

            const gridEffect = document.createElement('div'); //('.card__grid-effect');
            gridEffect.classList.add('card__grid-effect');// '.card__grid-effect'
            
            var n_points = 200;
            if(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/Android/i)){
                n_points = 100;
                gridEffect.style.gridTemplateColumns = "repeat(10, 1fr)";
            }

            for (let i = 1; i <= n_points; i++) {
                const tile = document.createElement('a');
                tile.classList.add('card__grid-effect-tile');
                tile.style.backgroundColor = sightGridColor;
                tile.href = "#";
                tile.id = `${i}_id`;
                //Add any additional logic for each tile
                gridEffect.appendChild(tile);
            }
            
            const gridContainer = document.getElementById('grid_container');
            gridContainer.appendChild(gridEffect);
        });
    }

    
    function onCursor(x, y, fix, blink)
    {
        if(!eyeTilesRun){
            return; 
        }
          
        if(sightGrid)
        {
            const grid_spots = document.querySelectorAll('.card__grid-effect-tile');
                
            grid_spots.forEach((grid_spot) => {
                var rect = grid_spot.getBoundingClientRect();
                var dist = 1/calculateDistance(x,y,rect.x,rect.y)*200;
    
                if (dist < 1) {
                    grid_spot.style.width = '0.1rem';
                    grid_spot.style.height = '0.1rem';
                } else if (dist > 1) {
                    grid_spot.style.width = '1rem';
                    grid_spot.style.height = '1rem';
                } else {
                    grid_spot.style.width = `${dist}rem`;
                    grid_spot.style.height = `${dist}rem`;
                }
            })
        }

        var error_margin = 5;
        const eyeTiles = tiles_list;
        // I need intermediate variable to pass that value to inner cards loop
        // TODO: check if there is more proper way to do it
        eyeTiles.forEach((eyeTile) =>
        {
            var rect = eyeTile.getBoundingClientRect();

            if(((rect.x - error_margin < x)) && ((x < rect.x + rect.width + error_margin)) && ((rect.y - error_margin < y)) && ((y < rect.y + rect.height + error_margin)))
            {
                onTile(eyeTile.id, fix, blink);
            }

        });
    }

    EyeGestureApi(API_KEY, fix_point, freeze_radius,
        {
            onCursor : onCursor,
            onCalibration : onCalibration,
            calibration : calibration, 
            calibration_layout : calibration,
            display_width : display_width,
            display_height: display_height,
        }
    );
};