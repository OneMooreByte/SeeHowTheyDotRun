// ------------------------------
// Global references
// ------------------------------
const tableBody = document.getElementById("tableBody");
const addRowBtn = document.getElementById("addRowBtn");
const toggle6PtrsBtn = document.getElementById("toggle6PtrsBtn");
const toggle4PtrsBtn = document.getElementById("toggle4PtrsBtn");
const toggleGFIBtn = document.getElementById("toggleGFIBtn");
const toggleLTDBtn = document.getElementById("toggleLTDBtn");
const toggle0PtrsBtn = document.getElementById("toggle0PtrsBtn");
const toggleNegPtrsBtn = document.getElementById("toggleNegPtrsBtn");


let show6Ptrs = false;
let show4Ptrs = false;
let showGFI = false;
let showLTD = true;
let show0Ptrs = false;
let showNegPtrs = true;

toggle6PtrsBtn.classList.toggle("active", show6Ptrs);
toggle4PtrsBtn.classList.toggle("active", show4Ptrs);
toggleGFIBtn.classList.toggle("active", showGFI);
toggleLTDBtn.classList.toggle("active", showLTD);
toggle0PtrsBtn.classList.toggle("active", show0Ptrs);
toggleNegPtrsBtn.classList.toggle("active", showNegPtrs);

let decks = [];

function addAlpha(color, alpha) {
    if(color.startsWith("hsl(")){
     return color.replace('hsl(', 'hsla(').replace(')', `, ${alpha})`);
    }else if(color.startsWith("rgb(")){
     return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
}

function linkCharts(chartType){
    let linkFromPriSec="Primary";
    let linkToPriSec="Secondary";

    linkFromName='chart'+chartType+linkFromPriSec;
    linkToName='chart'+chartType+linkToPriSec;

    const linkFromElement = document.getElementById(linkFromName);
    const linkToElement = document.getElementById(linkToName);
    //link zoom
  const flags = new Map();
  flags.set(linkFromElement, false);
  flags.set(linkToElement, false);

  function sync(source, target, eventData) {
    if (flags.get(source)) return;

    const update = {};

    // If zoom/pan or autoscale occurs, compute the resulting range
    let xRange = null;
    let yRange = null;

    // If user zoomed/panned
    if (eventData['xaxis.range[0]'] && eventData['xaxis.range[1]']) {
      xRange = [eventData['xaxis.range[0]'], eventData['xaxis.range[1]']];
    }

    if (eventData['yaxis.range[0]'] && eventData['yaxis.range[1]']) {
      yRange = [eventData['yaxis.range[0]'], eventData['yaxis.range[1]']];
    }

    // If user clicked reset/autoscale, Plotly may set autorange=true
    // In that case, get the new computed range from source.layout
    if (eventData['xaxis.autorange'] || xRange === null) {
      xRange = [source.layout.xaxis.range[0], source.layout.xaxis.range[1]];
    }

    if (eventData['yaxis.autorange'] || yRange === null) {
      yRange = [source.layout.yaxis.range[0], source.layout.yaxis.range[1]];
    }

    update['xaxis.range'] = xRange;
    update['yaxis.range'] = yRange;

    // Apply update to target chart
    flags.set(target, true);
    Plotly.relayout(target, update).finally(() => flags.set(target, false));
  }

  linkFromElement.on('plotly_relayout', e => sync(linkFromElement, linkToElement, e));
  linkToElement.on('plotly_relayout', e => sync(linkToElement, linkFromElement, e));
  
    //link hover
    let hoverLock = false; // prevent infinite loop

    function syncHover(source, target) {
        source.on('plotly_hover', (eventData) => {
        if (hoverLock) return;
        hoverLock = true;

        // Find points closest to hovered x value
        const xVal = eventData.points[0].x;

        // Trigger hover on target chart
        Plotly.Fx.hover(target, {xval: xVal});

        hoverLock = false;
        });

        source.on('plotly_unhover', () => {
        if (hoverLock) return;
        hoverLock = true;

        // Remove hover on target chart
        Plotly.Fx.unhover(target);

        hoverLock = false;
        });
    }

    syncHover(linkFromElement, linkToElement);
    syncHover(linkToElement, linkFromElement);
}

// Create numeric input cell for columns A–E
function createInputCell(deck, columnKey,initial,minValue,maxValue) {
  const cell = document.createElement("td");
  cell.dataset.col = columnKey;
    cell.style.textAlign = "center";

  const input = document.createElement("input");
  input.type = "number";
  input.value = initial;
  input.min = minValue;
  input.max = maxValue;
  input.style.textAlign = "center";

    input.addEventListener(`focus`, () => input.select());

    input.addEventListener("change", () => {
        if (Number(input.value) > input.max) {
            input.value = input.max;
        }
        if (Number(input.value) < input.min) {
            input.value = input.min;
        }
        if (Number(input.value) == 0) {
            input.value = "";
        }
    });

  input.addEventListener("change", () => deck.update());
  input.addEventListener("change", () => updateVisuals());


  cell.appendChild(input);
  return cell;
}

// Reset all inputs in a column to blank
function resetColumn(colKey) {
  tableBody
    .querySelectorAll(`td[data-col="${colKey}"] input`)
    .forEach(input => (input.value = ""));
}


//Create Row
function createRow(deckName="",deckSize=49,ptr6="",ptr4="",ptr3_Std=2,ptr3_GFI="",ptr2_Std=7,ptr2_LTD="",ptr1="",ptr0="",ptrNeg="",initialSelect=false) {
    let colorID = -1;
    for(i=0;i<deckColorReservations.length;i++){
        if(deckColorReservations[i]==false)
        {
            deckColorReservations[i]=true;
            colorID = i;
            break;
        }
    }
    if(colorID<0){
        console.log("Unable to reserve color ID")
        return false;
    }


  let createdDeckRow = new DeckRow();
  createdDeckRow.colorID = i;
  createdDeckRow.rowElement = document.createElement("tr");

  // Deck name column
  const nameCell = document.createElement("td");
    nameCell.dataset.col = "deckName";
        nameCell.dataset.classList = "deckName";
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Deck Name";
  if(deckName==""){deckName ="Deck#"+newDeckNumber}
  nameInput.value = deckName;
  newDeckNumber++;
nameInput.addEventListener("change", () => createdDeckRow.update());
nameInput.addEventListener("change", () => updateVisuals());
  nameCell.appendChild(nameInput);
  createdDeckRow.rowElement.appendChild(nameCell);


  // Agenda Columns
  createdDeckRow.rowElement.appendChild(createInputCell(createdDeckRow, "deckSize",deckSize,30,89));
  createdDeckRow.rowElement.appendChild(createInputCell(createdDeckRow, "deck6Ptrs",ptr6,0,hardLimit6Ptrs));
  createdDeckRow.rowElement.appendChild(createInputCell(createdDeckRow, "deck4Ptrs",ptr4,0,hardLimit4Ptrs));
  createdDeckRow.rowElement.appendChild(createInputCell(createdDeckRow, "deck3Ptrs_Std",ptr3_Std,0,hardLimit3Ptrs));
  createdDeckRow.rowElement.appendChild(createInputCell(createdDeckRow, "deck3Ptrs_GFI",ptr3_GFI,0,3));
  createdDeckRow.rowElement.appendChild(createInputCell(createdDeckRow, "deck2Ptrs_Std",ptr2_Std,0,hardLimit2Ptrs));
    createdDeckRow.rowElement.appendChild(createInputCell(createdDeckRow, "deck2Ptrs_LTD",ptr2_LTD,0,3));
createdDeckRow.rowElement.appendChild(createInputCell(createdDeckRow, "deck1Ptrs",ptr1,0,hardLimit1Ptrs));
createdDeckRow.rowElement.appendChild(createInputCell(createdDeckRow, "deck0Ptrs",ptr0,0,hardLimit0Ptrs));
createdDeckRow.rowElement.appendChild(createInputCell(createdDeckRow, "deckNegPtrs",ptrNeg,0,hardLimitNegPtrs));

  // Non Agendas
  const totalPtsCell = document.createElement("td");
  totalPtsCell.className = "deckPts outputCol";
  totalPtsCell.col = "deckPts";  
  totalPtsCell.textContent = "0";
  createdDeckRow.rowElement.appendChild(totalPtsCell);

  // Non Agendas
  const percentOfDeckCell = document.createElement("td");
  percentOfDeckCell.className = "percentOfDeck outputCol";
  percentOfDeckCell.col = "percentOfDeck";
  percentOfDeckCell.textContent = "0";
  createdDeckRow.rowElement.appendChild(percentOfDeckCell);

  // Average Win Number
  const winAvgCell = document.createElement("td");
  winAvgCell.className = "winAvgNumber outputCol";
winAvgCell.col = "winAvgNumber";
  winAvgCell.textContent = "0";
  createdDeckRow.rowElement.appendChild(winAvgCell);

    // Median Win Number
  const winMedCell = document.createElement("td");
  winMedCell.className = "winMedNumber outputCol";
winMedCell.col = "winMedNumber";
  winMedCell.textContent = "0";
  createdDeckRow.rowElement.appendChild(winMedCell);

    // Selector Cell
  const selectorCell = document.createElement("td");
  selectorCell.dataset.col = "selectorCell";
    selectorCell.style.textAlign = "center";

  const selectorInput = document.createElement("input");
  selectorInput.type = "checkbox";
  selectorInput.checked = initialSelect;
    selectorInput.className = "deck-selector";
  
  selectorInput.addEventListener("change", () => {
    // Count how many are checked
    const checked = document.querySelectorAll(".deck-selector:checked");
    if (checked.length > 2) {
      // If more than 2, uncheck all except this one
      for(let i =0;i<checked.length;i++){
        checked[i].checked=false;
      }
      selectorInput.checked = true;
    }
  });

  selectorInput.addEventListener("change", () => updateVisuals());
  selectorCell.appendChild(selectorInput);
  createdDeckRow.rowElement.appendChild(selectorCell);

  // Delete button column
  const actionCell = document.createElement("td");
  const deleteBtn = document.createElement("button");
  actionCell.className = "delete";
  deleteBtn.textContent = "X";
  deleteBtn.className = "delete";

  deleteBtn.addEventListener("click", () => {
    if (tableBody.rows.length > 1) {
       deckColorReservations[createdDeckRow.colorID]=false;
        //delete from table
      createdDeckRow.rowElement.remove();
        //delete from decks array
        let index = decks.indexOf(createdDeckRow);
        if (index !== -1) {
        decks.splice(index, 1);
        }

      updateDeleteAddButtons();
      updateVisuals();
    }
  });

  actionCell.appendChild(deleteBtn);
  createdDeckRow.rowElement.appendChild(actionCell);

  tableBody.appendChild(createdDeckRow.rowElement);

    decks.push(createdDeckRow);

  applyColumnVisibility();
  createdDeckRow.update();
  updateDeleteAddButtons();
}

// Enable/disable delete buttons based on row count
function updateDeleteAddButtons() {
  const canDelete = tableBody.rows.length > 1;
  tableBody.querySelectorAll(".delete").forEach(btn => {
    btn.disabled = !canDelete;
  });
  const canAdd = tableBody.rows.length < 8;
  addRowBtn.disabled = !canAdd;

}

// ------------------------------
// Column visibility & header adjustment
// ------------------------------
function applyColumnVisibility() {
  // Body cells
  tableBody.querySelectorAll("tr").forEach(row => {
    row.querySelectorAll('td[data-col="deck6Ptrs"]').forEach(td =>
      td.classList.toggle("hidden", !show6Ptrs)
    );
    });

    tableBody.querySelectorAll("tr").forEach(row => {
    row.querySelectorAll('td[data-col="deck4Ptrs"]').forEach(td =>
    td.classList.toggle("hidden", !show4Ptrs)
    );
    });

    tableBody.querySelectorAll("tr").forEach(row => {
    row.querySelectorAll('td[data-col="deck3Ptrs_GFI"]').forEach(td =>
    td.classList.toggle("hidden", !showGFI)
    );
    });

    tableBody.querySelectorAll("tr").forEach(row => {
    row.querySelectorAll('td[data-col="deck2Ptrs_LTD"]').forEach(td =>
    td.classList.toggle("hidden", !showLTD)
    );
    });

    tableBody.querySelectorAll("tr").forEach(row => {
    row.querySelectorAll('td[data-col="deck0Ptrs"]').forEach(td =>
    td.classList.toggle("hidden", !show0Ptrs)
    );
    });

    tableBody.querySelectorAll("tr").forEach(row => {
    row.querySelectorAll('td[data-col="deckNegPtrs"]').forEach(td =>
    td.classList.toggle("hidden", !showNegPtrs)
    );
    });

  // Header cells
  document.querySelectorAll(".col-6").forEach(el =>
    el.classList.toggle("hidden", !show6Ptrs)
  );
  document.querySelectorAll(".col-4").forEach(el =>
    el.classList.toggle("hidden", !show4Ptrs)
  );
  document.querySelectorAll(".col-0").forEach(el =>
    el.classList.toggle("hidden", !show0Ptrs)
  );
  document.querySelectorAll(".col-Neg").forEach(el =>
    el.classList.toggle("hidden", !showNegPtrs)
  );
  //For GFIand LTD, we will hide BOTH the standard and GFI/LTD cells, because standard means nothing without the other
  document.querySelectorAll(".col-3GFI").forEach(el =>
    el.classList.toggle("hidden", !showGFI)
  );
  document.querySelectorAll(".col-3Std").forEach(el =>
    el.classList.toggle("hidden", !showGFI)
  );
  document.querySelectorAll(".col-2LTD").forEach(el =>
    el.classList.toggle("hidden", !showLTD)
  );
  document.querySelectorAll(".col-2Std").forEach(el =>
    el.classList.toggle("hidden", !showLTD)
  );

  updateGroupHeaderSpans();
}

// Adjust the 2 and 3 point header spans based on if they have the variations shown
function updateGroupHeaderSpans() {
  const header3Ptr = document.querySelector("thead th.col-3");
  if(showGFI)
  {
    header3Ptr.colSpan = 2;
    header3Ptr.rowSpan = 1;
  }
  else
  {
    header3Ptr.colSpan = 1;
    header3Ptr.rowSpan = 2;
  }

  const header2Ptr = document.querySelector("thead th.col-2");
  if(showLTD)
  {
    header2Ptr.colSpan = 2;
    header2Ptr.rowSpan = 1;
  }
  else
  {
    header2Ptr.colSpan = 1;
    header2Ptr.rowSpan = 2;
  }
}


// ------------------------------
// Row sum and visuals
// ------------------------------

function updateAllDecks() {
  for(let i =0;i<decks.length;i++){
    decks[i].update();
  }
  updateVisuals();
}

function updateVisuals() {
    updateSummaryVisuals();
    const checkboxes = document.querySelectorAll(".deck-selector");
    let numberOfDetailColumns = 0;
    for(let i=0;i<checkboxes.length;i++){
        if(checkboxes[i].checked){
            updateDetailVisuals(decks[i],numberOfDetailColumns==0);
            numberOfDetailColumns++;
            if(numberOfDetailColumns>1){break}  
        }
    }
    if(numberOfDetailColumns<2){hideDetailVisuals(false)};
    if(numberOfDetailColumns<1){hideDetailVisuals(true)};

    if(visualsLinked==false){
    linkCharts("HaveWon");
    linkCharts("ReachWin");
    linkCharts("Dive");
    visualsLinked=true;
    }
}

function updateSummaryVisuals(){

    let tracesWinVsAccess =[];
    let tracesQuartiles =[];
    let tracesViolin =[];
    let deckLabelIDs=[];
    let deckLabelNames=[];

    //Build traces for all decks
    for (const deckRow of decks){
        let deck = deckRow.deck;
        let deckIndex = decks.indexOf(deckRow);
        deckLabelIDs.push(deckIndex);
        deckLabelNames.push(deckRow.name);

        //Trace for Win vs Access Plot
        tracesWinVsAccess.push({
            x: deck.accessList,
            y: deck.haveWonProbPerAccess,
            type: "scatter",
            mode: "lines",
            line: {color: colorListDecks[deckRow.colorID]},
            name: deckRow.name
        });
        
        //Traces for violin plot
        //First we have the violin itself
        tracesViolin.push({
            type: 'violin',
            y: deckRow.deck.winPopulation,
            points: false,
            box: { visible: false },
            meanline: { visible: false },
            boxpoints: false,
            hoverinfo: 'skip',
            line: {color: colorListDecks[deckRow.colorID]},
            fillcolor: addAlpha(colorListDecks[deckRow.colorID],0.3),
            x: Array(deckRow.deck.winPopulation.length).fill(deckIndex)
        });
        //Then we have the custom box
        let boxwidth =0.24;
        //which we use instead of the auto generated because we want to use interpolated numbers
        tracesViolin.push({
            type: "box",
            q1: [deckRow.deck.percentile25WinAccess],
            median: [deckRow.deck.percentile50WinAccess],
            q3: [deckRow.deck.percentile75WinAccess],
            boxpoints: false,
            line: {color: colorListDecks[deckRow.colorID]},
            fillcolor: addAlpha(colorListDecks[deckRow.colorID],0.3),
            width: boxwidth,
            hoverinfo: 'skip',
            x: [deckIndex],
        });
        //Then we add the custom mean line
        tracesViolin.push({
            type: "scatter",
            mode: "lines",
            x: [deckIndex - boxwidth/2, deckIndex + boxwidth/2],
            y: [deckRow.deck.avgWinAccess, deckRow.deck.avgWinAccess],
            line: {
            color: colorListDecks[deckRow.colorID],
            width: 3,
            dash: "dot"
            },
            showlegend: false,
            hoverinfo: 'skip'
        });
        //Now we generate the custom hover text
        let customHoverText ="Average: "+deckRow.deck.avgWinAccess.toFixed(2)+"<br>"+
        "Median: "+deckRow.deck.percentile50WinAccess.toFixed(2)+"<br>"+
        "High 25%: "+deckRow.deck.percentile75WinAccess.toFixed(2)+"<br>"+
        "Low 25%: "+deckRow.deck.percentile25WinAccess.toFixed(2)+"<br>"+
        "<extra></extra>";
        
        //And we plot the point for the hover text
        tracesViolin.push({
            type: "scatter",
            x: [deckIndex],
            y: [5],
            mode: "markers",
            marker: {color: colorListDecks[deckRow.colorID], opacity: 0},
            hovertemplate: customHoverText,
            showlegend: false
        });
    }

    const layoutWinVsAccess = {
        uirevision: "keep",
        title: {text: "Chance Runner Has Won"},
        xaxis: { title: "Number of accesses", range: [0, 40], dtick:1,gridcolor: '#2a2a2a', zerolinecolor: '#3a3a3a', unifiedhovertitle: {text: "Access %{x}: Runner's<br>chance to have won"}},
        yaxis: { title: "", range: [0, 1],dtick:.1, tickformat: ".1%",gridcolor: '#2a2a2a', zerolinecolor: '#3a3a3a' },
        paper_bgcolor: 'rgba(0,0,0,0)', // Chart area background including legend and stuff
        plot_bgcolor: 'rgba(0,0,0,0)',   // Plotting area background
        font: { family: '"Orbitron", sans-serif', color: '#c8ffc8'},
        showlegend: false,
        hovermode: 'x unified',
        hoverlabel: {
            bgcolor: "black",
            font: { color: "white",family: '"Orbitron", sans-serif',size: 10 }
        },
        margin: { l: 60, r: 20, t: 30, b: 40 }
    };

    Plotly.react("chartSummaryWinVsAccess", tracesWinVsAccess, layoutWinVsAccess,plotlyConfig);

    const layoutViolin = {
        uirevision: "keep",
        violinmode: "overlay",
        title: {text: "Accesses Needed To Win"},
        xaxis: {title: "",tickvals: deckLabelIDs,ticktext: deckLabelNames,    tickangle: -45,gridcolor: '#2a2a2a', zerolinecolor: '#3a3a3a'},
        yaxis: { title: "Access",gridcolor: '#2a2a2a', zerolinecolor: '#3a3a3a', dtick: 2,range: [0,44]},
        paper_bgcolor: 'rgba(0,0,0,0)', // Chart area background including legend and stuff
        plot_bgcolor: 'rgba(0,0,0,0)',   // Plotting area background
        font: { family: '"Orbitron", sans-serif', color: '#c8ffc8'},
        showlegend: false,
        margin: { l: 60, r: 20, t: 30, b: 60 },
        violingap:.05,
        violingroupgap: 0,
        hovermode: "closest",
        hoverdistance: 500
    };

    Plotly.react('chartSummaryViolin', tracesViolin, layoutViolin,plotlyConfig);

}

function updateDetailVisuals(deckRow, primary){
    let suffix =""
    if(primary){
        suffix = "Primary"
    }else{
        suffix = "Secondary"        
    }
    document.getElementById("noMoreChartsSelectedWarning").style.display = "none";
    //--------------------------------------------------
    // Have won detailed plot
    //--------------------------------------------------
    document.getElementById("chartHaveWon"+suffix).style.display = "flex";
    const tracesHaveWon = [];
    //Of the wins, what was the agenda count
    //Looping backwards to have lower number of agendas on top
    for(let i=(6+hardLimit0Ptrs+hardLimitNegPtrs); i>=0; i--){
        if(deckRow.deck.winningAgendaCountPossible[i]){
            tracesHaveWon.push({
                x: deckRow.deck.accessList,
                y: deckRow.deck.probWinWithXNonNegAgendasPerAccess[i],  
                type: "scatter",
                mode: "none",
                fillcolor: addAlpha(colorListAgendaCount[i],0.3),
                stackgroup: 'one',
                name: i.toString()+" agendas"
            });
            //trace just for label
            //showing so that it aligns to position 40
            tracesHaveWon.push({
                x: [deckRow.deck.accessList[40]],
                y: [deckRow.deck.probWinWithXNonNegAgendasPerAccess[i][40]],
                type: "scatter",
                line: {color: 'rgba(0, 0, 0, 0)'},
                fillcolor: 'rgba(0,0,0,0)',
                mode: "lines+text",
                text: ["<br><br>"+i.toString()+" Agendas"],
                textposition: 'left',
                textfont: {
                    family: '"Orbitron", sans-serif',
                    size: 10,
                    color: 'rgba(155, 155, 155,1)'
                    },
                stackgroup: 'two',                       
                name: "",
                hovertemplate: null,
                hoverinfo: "skip"
              });
        }
    }
    tracesHaveWon.push({
        x: deckRow.deck.accessList,
        y: deckRow.deck.accessList,  
        type: "scatter",
        mode: "none",
        fillcolor: 'rgba(0, 0, 0, 0)',
        name: "Agenda Count Label",
        hovertemplate: "of the time with:<extra></extra>"
    });
    let labelStartIndex = 5;//which access ">=0" label will be
    //Have won chance
    tracesHaveWon.push({
        x:deckRow.deck.accessList,
        y:deckRow.deck.haveWonProbPerAccess,
        type: "scatter",
        line: {color: colorListDecks[deckRow.colorID]},
        mode: "lines",
        name: "Runner Has Won",
        hovertemplate: null,
        hovertemplate: "Runner has won %{y:.2%}<extra></extra>"
    });
    //Label for have won label
    tracesHaveWon.push({
        x: [deckRow.deck.accessList[labelStartIndex+(7+hardLimitNegPtrs)]],
        y: [deckRow.deck.haveWonProbPerAccess[labelStartIndex+(7+hardLimitNegPtrs)]],
        type: "scatter",
        line: {color: 'rgba(0,0,0,0)'},
        fillcolor: 'rgba(0,0,0,0)',
        mode: "lines+text",
        text: [" Runner has won"],
        textposition: 'bottom right',
        textfont: {
            family: '"Orbitron", sans-serif',
            size: 10,
            color: colorListDecks[deckRow.colorID]
            },
        name: "Runner Has Won",
        hovertemplate: null,
        hoverinfo: "skip"
    });       
    //Show %Chance at threat 3/4-6
    tracesHaveWon.push({
        x: deckRow.deck.accessList,
        y: deckRow.deck.threat4ProbPerAccess,  
        type: "scatter",
        mode: "none",
        fillcolor: 'rgba(0, 0, 0, 0)',
        name: "Threat4",
        hovertemplate: '<span style="color:#516751"><b>Threat 4-6:</b></span> %{y:.2%}<extra></extra>'
    });
    tracesHaveWon.push({
        x: deckRow.deck.accessList,
        y: deckRow.deck.threat3ProbPerAccess,  
        type: "scatter",
        mode: "none",
        fillcolor: 'rgba(0,0,0,0)',
        name: "Threat3",
        hovertemplate: '<span style="color:#ffde00"><b>Threat 3-6:</b></span> %{y:.2%}<extra></extra>'
    });

    //Non Winning Point Totals
    for(let i=6; i>=(1-hardLimitNegPtrs); i--){
        //Don't plot the lowest point total possible, because it will always be 100%
        if(deckRow.deck.pointPossible[i+hardLimitNegPtrs] && (i> (0-deckRow.deck.neg))){
            let labelPosition=labelStartIndex+(i*2+hardLimitNegPtrs);
            //main trace
            tracesHaveWon.push({
                x: deckRow.deck.accessList,
                y: deckRow.deck.atLeastProbPerAccess[i+hardLimitNegPtrs],
                type: "scatter",
                line: {color: colorListPoints[i+hardLimitNegPtrs],dash: "dot"},
                mode: "lines+text",
                name: "≥"+i.toString()+" pts",
                hovertemplate: null
            });
            //trace just for label
                tracesHaveWon.push({
                x: [deckRow.deck.accessList[labelPosition]],
                y: [deckRow.deck.atLeastProbPerAccess[i+hardLimitNegPtrs][labelPosition]],
                type: "scatter",
                line: {color: 'rgba(0,0,0,0)'},
                fillcolor: 'rgba(0,0,0,0)',
                mode: "lines+text",
                text: ["≥"+i+" "],
                textposition: 'bottom right',
                textfont: {
                    family: '"Orbitron", sans-serif',
                    size: 10,
                    color: colorListPoints[i+hardLimitNegPtrs]
                    },
                name: "≥"+i.toString()+" pts",
                hovertemplate: null,
                hoverinfo: 'skip'
            });
    
       }
    } 


  const layoutHaveWon = {
    uirevision: "keep",
    title: {text: "Probability of runner win by Access#"},
    hovermode: 'x unified',
    hoverlabel: {
        bgcolor: "black",
        font: {color: "white",family: 'monospace',size: 10}
    },
    xaxis: { title: "Number of accesses", range:[0,40],dtick:1,gridcolor: '#2a2a2a', zerolinecolor: '#3a3a3a', unifiedhovertitle: {text: "Access %{x}"}},
    yaxis: { title: "Probability", range: [0, 1], tickformat: ".1%",gridcolor: '#2a2a2a', zerolinecolor: '#3a3a3a' },
    barmode: "stack",
    bargap: 0,
     paper_bgcolor: 'rgba(0,0,0,0)', // Chart area background including legend and stuff
    plot_bgcolor: 'rgba(0,0,0,0)',   // Plotting area background
  font: { family: '"Orbitron", sans-serif', color: '#c8ffc8'},
    showlegend: false,
    margin: { l: 60, r: 20, t: 30, b: 40 }
  };

  Plotly.react("chartHaveWon"+suffix, tracesHaveWon, layoutHaveWon, plotlyConfig);

  //------------------------------------------------------------
  //Reach Win detailed plot
  //----------------------------------------------------------
    document.getElementById("chartReachWin"+suffix).style.display = "flex";
    const tracesReachWin = [];
    let peakIndex = 0;
    //Of the wins, what was the agenda count
    //Looping backwards to have lower number of agendas on top
    for(let i=(6+hardLimit0Ptrs+hardLimitNegPtrs); i>=0; i--){
        if(deckRow.deck.winningAgendaCountPossible[i]){
            tracesReachWin.push({
                x: deckRow.deck.accessList,
                y: deckRow.deck.probReachWinWithXNonNegAgendasPerAccess[i],  
                type: "scatter",
                mode: "none",
                fillcolor: addAlpha(colorListAgendaCount[i],0.3),
                stackgroup: 'one',
                name: i.toString()+" agendas"
            });
            //trace just for label
            //showing so that it aligns to the point where that agenda count is largest
            peakIndex = 0;
            for (let j = 1; j < deckRow.deck.accessList.length; j++) {
              if (deckRow.deck.probReachWinWithXNonNegAgendasPerAccess[i][j] > deckRow.deck.probReachWinWithXNonNegAgendasPerAccess[i][peakIndex]) peakIndex = j;
            }
            //This is messy** but I am doing it anyway
            //the stacking doesnt work well for the labels because I am not doing it on the same access
            //So I need another loop
            let newY = 0;
            for(let j=(6+hardLimit0Ptrs+hardLimitNegPtrs); j>=i; j--){
                newY += deckRow.deck.probReachWinWithXNonNegAgendasPerAccess[j][peakIndex];
            }
            tracesReachWin.push({
                x: [deckRow.deck.accessList[peakIndex]],
                y: [newY],
                type: "scatter",
                line: {color: 'rgba(0, 0, 0, 0)'},
                fillcolor: 'rgba(0,0,0,0)',
                mode: "lines+text",
                text: [i+" Agendas "],
                textposition: 'bottom',
                textfont: {
                    family: '"Orbitron", sans-serif',
                    size: 10,
                    color: 'rgba(155, 155, 155,1)'
                    },
                stackgroup: 'two',                       
                name: "",
                hovertemplate: null,
                hoverinfo: "skip"
              });
        }
    }
     tracesReachWin.push({
        x: deckRow.deck.accessList,
        y: deckRow.deck.reachWinProbPerAccess,
        type: "scatter",
        line: {color: colorListDecks[deckRow.colorID]},
        mode: "lines",
        name: "Win This Access",
        hovertemplate: "<span style='font-weight:normal; font-family:monospace'>Runner wins on<br>this access %{y:.2%}<br>of the time with:</span><extra></extra>",
        hoverlabel: {
        bgcolor: "black",
        font: { color: "white",family: 'monospace',size: 10 }
        }
    }); 
    //Label for reach win label
    peakIndex = 0;
    for (let j = 1; j < deckRow.deck.accessList.length; j++) {
        if (deckRow.deck.reachWinProbPerAccess[j] > deckRow.deck.reachWinProbPerAccess[peakIndex]) peakIndex = j;
    }
    tracesReachWin.push({
        x: [deckRow.deck.accessList[peakIndex]],
        y: [deckRow.deck.reachWinProbPerAccess[peakIndex]],
        type: "scatter",
        line: {color: 'rgba(0,0,0,0)'},
        mode: "lines+text",
        text: [" Runner Wins On Access"],
        textposition: 'top',
        textfont: {
            family: '"Orbitron", sans-serif',
            size: 10,
            color: colorListDecks[deckRow.colorID]
            },
        name: "Runner Has Won",
        hovertemplate: null,
        hoverinfo: "skip"
    });   

    const layoutReachWin = {
    uirevision: "keep",
    title: {text: "Probability of runner win on Access#"},
    hovermode: 'x unified',
      hoverlabel: {
        bgcolor: "black",
        font: { color: "white",family: 'monospace',size: 10 }
        },
    xaxis: { title: "Number of accesses", range:[0,40],dtick:1,gridcolor: '#2a2a2a', zerolinecolor: '#3a3a3a', unifiedhovertitle: {text: "Access %{x}"}},
    yaxis: { title: "Probability", range: [0, 0.09], tickformat: ".1%",dtick:0.01,gridcolor: '#2a2a2a', zerolinecolor: '#3a3a3a' },
    barmode: "stack",
    bargap: 0,
     paper_bgcolor: 'rgba(0,0,0,0)', // Chart area background including legend and stuff
    plot_bgcolor: 'rgba(0,0,0,0)',   // Plotting area background
  font: { family: '"Orbitron", sans-serif', color: '#c8ffc8'},
    showlegend: false,
    margin: { l: 60, r: 20, t: 30, b: 40 }
  };

  Plotly.react("chartReachWin"+suffix, tracesReachWin, layoutReachWin,plotlyConfig);

  //----------------------------------------------
  //Deep Dive Chart
  //---------------------------------------------
      document.getElementById("chartDive"+suffix).style.display = "flex";
      const tracesDive = [];
    //Have won chance
    tracesDive.push({
        x:deckRow.deck.accessList,
        y:deckRow.deck.haveWonProbPerAccess,
        type: "scatter",
        line: {color: colorListDecks[deckRow.colorID]},
        mode: "lines",
        name: "w/o Deep Dive",
        hovertemplate: null,
    });
    let tempColor ='hsl(115,55%,51%)';
    let diff = deckRow.deck.totalWinDeepDiveSingleClickPerAccess.map((v, i) => v - deckRow.deck.haveWonProbPerAccess[i]);
    tracesDive.push({
        x:deckRow.deck.accessList,
        y:deckRow.deck.totalWinDeepDiveSingleClickPerAccess,
        type: "scatter",
        line: {color: tempColor, dash: 'dash'},
        fill: 'tonexty',
        fillcolor: addAlpha(tempColor,.15),
        mode: "lines",
        name: "1Click 1Dive",
        customdata: diff,
        hovertemplate:"1xC, 1xDD: %{y:.2%} (+%{customdata:.2%})<extra></extra>",
    }); 
    tempColor = 'hsl(192, 52%, 55%)';
    diff = deckRow.deck.totalWinDeepDiveDoubleClickPerAccess.map((v, i) => v - deckRow.deck.haveWonProbPerAccess[i]);
    tracesDive.push({
        x:deckRow.deck.accessList,
        y:deckRow.deck.totalWinDeepDiveDoubleClickPerAccess,
        type: "scatter",
        line: {color: tempColor, dash: 'dash'},
        fill: 'tonexty',
        fillcolor: addAlpha(tempColor,.15),
        mode: "lines",
        name: "2Click 1Dive",
        customdata: diff,
        hovertemplate:"2xC, 1xDD: %{y:.2%} (+%{customdata:.2%})<extra></extra>",
    });
    tempColor = 'hsl(249,52%,55%)'; 
    diff = deckRow.deck.totalWinDeepDiveDoubleDiveNoTrashPerAccess.map((v, i) => v - deckRow.deck.haveWonProbPerAccess[i]);   
    tracesDive.push({
        x:deckRow.deck.accessList,
        y:deckRow.deck.totalWinDeepDiveDoubleDiveNoTrashPerAccess,
        type: "scatter",
        line: {color: tempColor, dash: 'dash'},
        fill: 'tonexty',
        fillcolor: addAlpha(tempColor,.15),
        mode: "lines",
        name: "2Click 2Dive",
        customdata: diff,
        hovertemplate: "2xC, 2xDD: %{y:.2%} (+%{customdata:.2%})<extra></extra>",
    }); 

  const layoutDive = {
    uirevision: "keep",
    title: {text: "Probability of runner win w/ Deep Dive"},
    hovermode: 'x unified',
    hoverlabel: {
        bgcolor: "black",
        font: {color: "white",family: 'monospace',size: 10}
    },
    xaxis: { title: "Number of accesses", range:[0,40],dtick:1,gridcolor: '#2a2a2a', zerolinecolor: '#3a3a3a', unifiedhovertitle: {text: "Access %{x} (C=Click DD=Deep Dive)"}},
    yaxis: { title: "Probability", range: [0, 1], tickformat: ".1%",gridcolor: '#2a2a2a', zerolinecolor: '#3a3a3a' },
    barmode: "stack",
    bargap: 0,
     paper_bgcolor: 'rgba(0,0,0,0)', // Chart area background including legend and stuff
    plot_bgcolor: 'rgba(0,0,0,0)',   // Plotting area background
  font: { family: '"Orbitron", sans-serif', color: '#c8ffc8'},
    showlegend: false,
    margin: { l: 60, r: 20, t: 30, b: 40 }
  };

  Plotly.react("chartDive"+suffix, tracesDive, layoutDive, plotlyConfig);
}

function hideDetailVisuals(primary){
    let suffix =""
    if(primary){
        suffix = "Primary"
      document.getElementById("noMoreChartsSelectedWarning").style.display = "flex";
    }else{
        suffix = "Secondary"        
    }
    document.getElementById("chartHaveWon"+suffix).style.display = "none";
    document.getElementById("chartReachWin"+suffix).style.display = "none";
    document.getElementById("chartDive"+suffix).style.display = "none";

}

// ------------------------------
// Column toggle buttons
// ------------------------------
toggle6PtrsBtn.addEventListener("click", () => {
  show6Ptrs = !show6Ptrs;
  toggle6PtrsBtn.classList.toggle("active", show6Ptrs);
  resetColumn("deck6Ptrs");
  applyColumnVisibility();
  updateAllDecks();
});

toggle4PtrsBtn.addEventListener("click", () => {
  show4Ptrs = !show4Ptrs;
  toggle4PtrsBtn.classList.toggle("active", show4Ptrs);
  resetColumn("deck4Ptrs");
  applyColumnVisibility();
  updateAllDecks();
});

toggleGFIBtn.addEventListener("click", () => {
  showGFI = !showGFI;
  toggleGFIBtn.classList.toggle("active", showGFI);
  resetColumn("deck3Ptrs_GFI");
  applyColumnVisibility();
  updateAllDecks();
});

toggleLTDBtn.addEventListener("click", () => {
  showLTD = !showLTD;
  toggleLTDBtn.classList.toggle("active", showLTD);
  resetColumn("deck2Ptrs_LTD");
  applyColumnVisibility();
  updateAllDecks();
});

toggle0PtrsBtn.addEventListener("click", () => {
  show0Ptrs = !show0Ptrs;
  toggle0PtrsBtn.classList.toggle("active", show0Ptrs);
  resetColumn("deck0Ptrs");
  applyColumnVisibility();
  updateAllDecks();
});

toggleNegPtrsBtn.addEventListener("click", () => {
  showNegPtrs = !showNegPtrs;
  toggleNegPtrsBtn.classList.toggle("active", showNegPtrs);
  resetColumn("deckNegPtrs");
  applyColumnVisibility();
  updateAllDecks();
});

// ------------------------------
// Expandable sections
// ------------------------------
document.querySelectorAll(".section-toggle").forEach(button => {
  button.addEventListener("click", () => {
    const content = button.nextElementSibling;
    const isActive = button.classList.contains("active");

    if (isActive) {
      content.style.display = "none";
      button.classList.remove("active");
    } else {
      content.style.display = "block";
      button.classList.add("active");
    }
  });
});


///-----STATS STUFF -------/


function nChoosek (n, k){
    
      // Checking if n and k are integer
      if(Number.isNaN(n) || Number.isNaN(k)){
        return NaN;
      }
        //If k is neg or less than n, there are no possibilities
      if(k < 0 || k > n){
        return 0
      }
      // simple case, if k=0 or k=n, there is only 1 possibility
      if(k === 0 || k === n){
        return 1
      }
      // simple case, if k=1 or k=n-1, there is n possibilities
      if(k === 1 || k === n - 1){
        return n
      }
    
      let result = n;
      for(let i = 2; i <= k; i++){
        result *= (n - i + 1) / i;
      }
    
      //Have to round because there may be floating point remanants
      return Math.round(result);
    }


class DeckRow {
    constructor(){
        this.deck = new DeckList;
        this.rowElement =  document.createElement("tr");
        this.name = "";
        this.colorID = -1;
    }

    update(){

    this.name = this.rowElement.querySelector('[data-col="deckName"]').querySelector('input').value;
    this.deck.size = Number(this.rowElement.querySelector('[data-col="deckSize"]').querySelector('input').value);
    this.deck.six = Number(this.rowElement.querySelector('[data-col="deck6Ptrs"]').querySelector('input').value);
    this.deck.four = Number(this.rowElement.querySelector('[data-col="deck4Ptrs"]').querySelector('input').value);
    let ptrs3_Std = Number(this.rowElement.querySelector('[data-col="deck3Ptrs_Std"]').querySelector('input').value);
    this.deck.three = ptrs3_Std;
    let ptrs3_GFI = Number(this.rowElement.querySelector('[data-col="deck3Ptrs_GFI"]').querySelector('input').value);
    let ptrs2_Std = Number(this.rowElement.querySelector('[data-col="deck2Ptrs_Std"]').querySelector('input').value);
    this.deck.two = ptrs2_Std+ptrs3_GFI;
    let ptrs2_LTD = Number(this.rowElement.querySelector('[data-col="deck2Ptrs_LTD"]').querySelector('input').value);
    let ptrs1 = Number(this.rowElement.querySelector('[data-col="deck1Ptrs"]').querySelector('input').value);
    this.deck.one = ptrs2_LTD+ptrs1;
    this.deck.zero = Number(this.rowElement.querySelector('[data-col="deck0Ptrs"]').querySelector('input').value);
    this.deck.neg = Number(this.rowElement.querySelector('[data-col="deckNegPtrs"]').querySelector('input').value);

    this.deck.calcDeckStats();
    //Agenda points from the corps perspective
    let agendaPoints =this.deck.six*6+this.deck.four*4+ptrs3_Std*3+(ptrs3_GFI+ptrs2_Std)*2+(ptrs2_LTD+this.deck.one);
    let invalidPoints = (agendaPoints<Math.ceil(0.01+(this.deck.size/5))*2) || (agendaPoints>Math.ceil(0.01+(this.deck.size/5))*2+1);
    this.rowElement.querySelector(".deckPts").textContent = agendaPoints;
    this.rowElement.querySelector(".deckPts").classList.toggle("invalid", invalidPoints)
    //Percent of Deck
    this.rowElement.querySelector(".percentOfDeck").textContent = Number.parseFloat(100*this.deck.agendas/this.deck.size).toFixed(1)+"%";
    //Avg Win
    this.rowElement.querySelector(".winAvgNumber").textContent =Number.parseFloat(this.deck.avgWinAccess).toFixed(2);
    //Median Win
    this.rowElement.querySelector(".winMedNumber").textContent =Number.parseFloat(this.deck.percentile50WinAccess).toFixed(2);

    }
}

class DeckList {
    constructor(size,deck6Ptrs,deck4Ptrs,deck3Ptrs,deck2Ptrs,deck1Ptrs,deck0Ptrs,deckNegPtrs){
        //Basic Deck List set
        //Will be set in setDeck()
        this.size = 0;
        this.six=0;
        this.four=0;
        this.three=0;
        this.two=0;
        this.one=0;
        this.zero=0;
        this.neg=0;
        this.agendas=0;
        this.non=0;

        //Will calculate the scored limit for each agenda for this deck (ie. the maximum scored agendas of each type while still not having won)
        //Calculated calcDeckStats()
        this.scoredLimitNegPtrs = 0;
        this.scoredLimit0Ptrs = 0;
        this.scoredLimit6Ptrs = 0;
        this.scoredLimit4Ptrs = 0;
        this.scoredLimit3Ptrs = 0;
        this.scoredLimit2Ptrs = 0;
        this.scoredLimit1Ptrs = 0;

        //Will be a 2D array where first index is the point value index, and the second is the access number;
        this.pointProbPerAccess = [];
        //True or false array of each point value, if it is possible
        this.pointPossible = Array(7+hardLimitNegPtrs).fill(false);
        //True or false array of each point value, if it is possible
        this.winningAgendaCountPossible = Array(7+hardLimit0Ptrs+hardLimitNegPtrs).fill(false);        
        //Will be a 2D array where first index is the point value index, and the second is the access number;
        this.atLeastProbPerAccess = [];
        //Chance to have won on or before the access #
        this.haveWonProbPerAccess = [];
        //Chance to have not won on or before the access #
        this.haveNotWonProbPerAccess = [];
        //Chance to reach win on the access #
        this.reachWinProbPerAccess = [];
        //threat3/4or more (but not having won already) probability per access
        this.threat3ProbPerAccess = [];
        this.threat4ProbPerAccess = [];


        //Will be an array of all the possible point spreads
        this.pointSpreads = [];
        //All possible deep dive spreads with this deck
        this.deepDiveSpreads = [];
        //Array of access #'s starting at 0 up to deck size
        this.accessList =[];

        //Create arrays for probability of deep dive win after each access
        this.totalWinDeepDiveSingleClickPerAccess =[];
        this.totalWinDeepDiveDoubleClickPerAccess =[];
        this.totalWinDeepDiveDoubleDiveNoTrashPerAccess =[];
        this.totalWinDeepDiveDoubleDiveWithTrashPerAccess =[]; 


        //Chance of winning ON this access, with a certain number of agendas
        this.probReachWinWithXAgendasPerAccess = [];
        this.probWinWithXAgendasPerAccess = [];
        this.probReachWinWithXNonNegAgendasPerAccess = [];
        this.probWinWithXNonNegAgendasPerAccess = [];

        //Runner wins, on average, on this access number
        this.avgWinAccess=0;
        this.percentile50WinAccess=0;
        this.percentile25WinAccess=0;
        this.percentile75WinAccess=0;

        //Popultion of win results to be used for a violin chart
        this.winPopulation = [];
    }

    setDeck(size=49,deck6Ptrs=0,deck4Ptrs=0,deck3Ptrs=0,deck2Ptrs=10,deck1Ptrs=0,deck0Ptrs=0,deckNegPtrs=0){
        this.size = size;
        this.six=deck6Ptrs;
        this.four=deck4Ptrs;
        this.three=deck3Ptrs;
        this.two=deck2Ptrs;
        this.one=deck1Ptrs;
        this.zero=deck0Ptrs;
        this.neg=deckNegPtrs;
    }

    calcDeckStats(){
        
        this.agendas=this.six+this.four+this.three+this.two+this.one+this.zero+this.neg;
        this.non=this.size-this.agendas;

        //calculate the scored limit for each agenda for this deck (ie. the maximum scored agendas of each type while still not having won)
        this.scoredLimitNegPtrs = Math.min(absScoredLimitNegPtrs,this.neg);
        this.scoredLimit0Ptrs = Math.min(absScoredLimit0Ptrs,this.zero);
        this.scoredLimit6Ptrs = Math.min(absScoredLimit6Ptrs,this.six);
        this.scoredLimit4Ptrs = Math.min(absScoredLimit4Ptrs,this.four);
        this.scoredLimit3Ptrs = Math.min(absScoredLimit3Ptrs,this.three);
        this.scoredLimit2Ptrs = Math.min(absScoredLimit2Ptrs,this.two);
        this.scoredLimit1Ptrs = Math.min(absScoredLimit1Ptrs,this.one); 

        this.calcPointSpreads();
        this.calcDeepDiveSpreads();
        this.calcProbs();
    }

    calcPointSpreads(){
        //Reset point spreads array
        this.pointSpreads.length = 0;

        //Initialize possible point values array
        this.pointPossible.fill(false);
        this.winningAgendaCountPossible.fill(false);

        let currentPosPoints =0;
        let currentNegPoints =0;
        //Going in reverse point order, so that on creation we can find the pointSpread that this will move to after scoring any non negative agenda
        //This will help for Deep Dive Math
        for (let currentPoints = 6; currentPoints  >= (0-this.scoredLimitNegPtrs); currentPoints--) {
            for (let scored6Ptrs = 0; scored6Ptrs <= this.scoredLimit6Ptrs; scored6Ptrs++){
                for (let scored4Ptrs = 0; scored4Ptrs <= this.scoredLimit4Ptrs; scored4Ptrs++){  
                    for (let scored3Ptrs = 0; scored3Ptrs <= this.scoredLimit3Ptrs; scored3Ptrs++){   
                        for (let scored2Ptrs = 0; scored2Ptrs <= this.scoredLimit2Ptrs; scored2Ptrs++){ 
                            for (let scored1Ptrs = 0; scored1Ptrs <= this.scoredLimit1Ptrs; scored1Ptrs++){
                                currentPosPoints = scored6Ptrs*6+ scored4Ptrs*4+ scored3Ptrs*3+ scored2Ptrs*2+ scored1Ptrs*1;
                                currentNegPoints = currentPosPoints - currentPoints;
                                if(currentNegPoints >= 0 && currentNegPoints <= this.scoredLimitNegPtrs){
                                    //For 0 Pointers we are looping backwards, for same reason we are looping points backwards
                                    for (let scored0Ptrs = this.scoredLimit0Ptrs; scored0Ptrs >= 0; scored0Ptrs--){
                                        this.pointSpreads.push(new PointSpread(scored6Ptrs,scored4Ptrs,scored3Ptrs,scored2Ptrs,scored1Ptrs,scored0Ptrs,currentNegPoints));
                                        //Set the possibility for this point value and this agenda count to be true. will be used in plotting
                                        this.pointPossible[this.pointSpreads[this.pointSpreads.length-1].totalScoredPoints+hardLimitNegPtrs] = true;
                                        //Looping through the existing point spreads to find the ones that match for where this one will go to
                                        //Could be a more efficient method for doing this, but it should be fine
                                        for (const potentialProgression of this.pointSpreads){
                                            if(potentialProgression.isProgressionFrom(this.pointSpreads[this.pointSpreads.length-1], 6)){
                                                this.pointSpreads[this.pointSpreads.length-1].proggression6Ptr = potentialProgression;
                                            } else if(potentialProgression.isProgressionFrom(this.pointSpreads[this.pointSpreads.length-1], 4)){
                                                this.pointSpreads[this.pointSpreads.length-1].proggression4Ptr = potentialProgression;
                                            } else if(potentialProgression.isProgressionFrom(this.pointSpreads[this.pointSpreads.length-1], 3)){
                                                this.pointSpreads[this.pointSpreads.length-1].proggression3Ptr = potentialProgression;
                                            } else if(potentialProgression.isProgressionFrom(this.pointSpreads[this.pointSpreads.length-1], 2)){
                                                this.pointSpreads[this.pointSpreads.length-1].proggression2Ptr = potentialProgression;
                                            } else if(potentialProgression.isProgressionFrom(this.pointSpreads[this.pointSpreads.length-1], 1)){
                                                this.pointSpreads[this.pointSpreads.length-1].proggression1Ptr = potentialProgression;
                                            } else if(potentialProgression.isProgressionFrom(this.pointSpreads[this.pointSpreads.length-1], 0)){
                                                this.pointSpreads[this.pointSpreads.length-1].proggression0Ptr = potentialProgression;
                                            }
                                        }
                                    }
                                } 
                            }
                        }
                    }
                }  
            }
        }
    }

    calcDeepDiveSpreads(){
        //Reset spreads array
        this.deepDiveSpreads.length = 0;

        for (let seen6Ptrs = 0; seen6Ptrs <= Math.min(8,this.six); seen6Ptrs++){
            for (let seen4Ptrs = 0; seen4Ptrs <= Math.min(8-seen6Ptrs,this.four); seen4Ptrs++){  
                for (let seen3Ptrs = 0; seen3Ptrs <= Math.min(8-(seen6Ptrs+seen4Ptrs),this.three); seen3Ptrs++){
                    for (let seen2Ptrs = 0; seen2Ptrs <= Math.min(8-(seen6Ptrs+seen4Ptrs+seen3Ptrs),this.two); seen2Ptrs++){
                        for (let seen1Ptrs = 0; seen1Ptrs <= Math.min(8-(seen6Ptrs+seen4Ptrs+seen3Ptrs+seen2Ptrs),this.one); seen1Ptrs++){
                            for(let seen0Ptrs = 0; seen0Ptrs <= Math.min(8-(seen6Ptrs+seen4Ptrs+seen3Ptrs+seen2Ptrs+seen1Ptrs),this.zero); seen0Ptrs++){
                                this.deepDiveSpreads.push(new DeepDiveSpread(seen6Ptrs,seen4Ptrs,seen3Ptrs,seen2Ptrs,seen1Ptrs, seen0Ptrs));
                            }
                        }
                    }
                }
            }  
        }

    }

    calcProbs(){
        //Initialize probability of being at each non-winning point value for each access, starting at 0%
        this.pointProbPerAccess =
        Array.from({ length: 7 + hardLimitNegPtrs }, () =>
            Array(this.size + 1).fill(0)
        );
        //For Score 0, the chance on access 0 is 100%
        this.pointProbPerAccess[hardLimitNegPtrs][0]=1;

        //Intialize probability of having AT LEAST this many points for each access, starting at 100%
        this.atLeastProbPerAccess =
        Array.from({ length: 7 + hardLimitNegPtrs }, () =>
            Array(this.size + 1).fill(1)
        );
        
        //For all point values greater than or equal to zero, the chance on access 0 starts at 0%
        for (let i=(0-hardLimitNegPtrs); i<7;i++){
            if(i>0){
            this.atLeastProbPerAccess[i+hardLimitNegPtrs][0]=0;
            }
        }

        //Initialize Win ON this access number with a certain amount of agendas ([0] = total chance, of all counts)      
        this.probReachWinWithXAgendasPerAccess = Array.from(
            { length: 8 + hardLimit0Ptrs+ (2*hardLimitNegPtrs)}, () =>
            Array(this.size + 1).fill(0)
        );
        //Same for the cumulative probability
        this.probWinWithXAgendasPerAccess = Array.from(
            { length: 8  + hardLimit0Ptrs+ (2*hardLimitNegPtrs)}, () =>
            Array(this.size + 1).fill(0)
        ); 

        //Initialize Win ON this access number with a certain amount of NON NEGATIVE agendas ([0] = total chance, of all counts)      
        this.probReachWinWithXNonNegAgendasPerAccess = Array.from(
            { length: 8 + hardLimit0Ptrs+hardLimitNegPtrs}, () =>
            Array(this.size + 1).fill(0)
        );
        //Same for cumulative probability
         this.probWinWithXNonNegAgendasPerAccess = Array.from(
            { length: 8 + hardLimit0Ptrs+hardLimitNegPtrs}, () =>
            Array(this.size + 1).fill(0)
        );     

        //Initialize win probability for each access, starting at 100%
        this.haveWonProbPerAccess = Array(this.size+1).fill(1);
        this.haveWonProbPerAccess[0]=0;

        //Initialize probability to not have won
        this.haveNotWonProbPerAccess = Array(this.size+1).fill(1);

        //Initialize the threat probabilities, starting at 0%
        this.threat3ProbPerAccess = Array(this.size+1).fill(0);
        this.threat4ProbPerAccess = Array(this.size+1).fill(0);



        //Initialize Deep Dive arrays
        this.totalWinDeepDiveSingleClickPerAccess = Array(this.size+1).fill(0);
        this.totalWinDeepDiveDoubleClickPerAccess = Array(this.size+1).fill(0);
        this.totalWinDeepDiveDoubleDiveNoTrashPerAccess = Array(this.size+1).fill(0);
        this.totalWinDeepDiveDoubleDiveWithTrashPerAccess = Array(this.size+1).fill(0);        

        this.accessList.length = this.size+1;

        const accessCombin = Array(this.size+1);
        for(let i = 0; i<this.size+1;i++)
        {
            this.accessList[i]=i;
            accessCombin[i] = nChoosek(this.size, i); 
        }


        for (const pointSpread of this.pointSpreads) {

            //If there are negative point agendas, some point spreads have a chance that they may have reached 7 prior.
            //We have to remove these possibilities, since that means they would have already won, and therefore not reached this point spread
            let probOfWinPrior = 0; 
            if(pointSpread.scoredNegPtrs>=1){                     
                //Calculate the chance that this spread was achieved by already reaching 7 (ie. the last non-0pt card was a -1)
                if(pointSpread.totalScoredPoints == 6){
                    //Calc chance that it ends with -1
                    probOfWinPrior += pointSpread.scoredNegPtrs/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs)                            
                    if(pointSpread.scoredNegPtrs>=2){
                        //Add chance that it ends with -1,-1,1
                        if(pointSpread.scored1Ptrs>=1){
                            probOfWinPrior += 
                                pointSpread.scored1Ptrs/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs)*
                                pointSpread.scoredNegPtrs/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs-1)*
                                (pointSpread.scoredNegPtrs-1)/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs-2);
                        }
                    }
                    if(pointSpread.scoredNegPtrs>=3){
                        //Add chance that it ends with:
                        //-1,-1,-1,2 OR -1,-1,-1,1,1 OR -1,-1,1,-1,1

                        if(pointSpread.scored2Ptrs>=1){
                        //-1,-1,-1,2 
                            probOfWinPrior += 
                                pointSpread.scored2Ptrs/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs)*
                                pointSpread.scoredNegPtrs/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs-1)*
                                (pointSpread.scoredNegPtrs-1)/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs-2)*
                                (pointSpread.scoredNegPtrs-2)/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs-3);
                        }

                        if(pointSpread.scored1Ptrs>=2){
                        //-1,-1,-1,1,1  &   -1,-1,1,-1,1 are the same probability, so we just 2x one calc
                            probOfWinPrior += 2* 
                                pointSpread.scored1Ptrs/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs)*
                                pointSpread.scored1Ptrs/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs-1)*
                                (pointSpread.scoredNegPtrs)/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs-2)*
                                (pointSpread.scoredNegPtrs-1)/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs-3)*
                                (pointSpread.scoredNegPtrs-2)/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs-4);
                        }
                    }
                }
                if(pointSpread.totalScoredPoints == 5 && pointSpread.scoredNegPtrs >=2){
                    //Calc chance that it ends with -1,-1
                    probOfWinPrior += 
                        pointSpread.scoredNegPtrs/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs)*
                        (pointSpread.scoredNegPtrs-1)/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs-1);

                    if(pointSpread.scoredNegPtrs>=3){
                        //Add chance that it ends with:
                        //-1,-1,-1,1 OR -1,-1,1,-1

                        if(pointSpread.scored1Ptrs>=1){
                        //-1,-1,-1,1 & -1,-1,1,-1 are the same probability, so we just 2x one calc
                            probOfWinPrior += 2* 
                                pointSpread.scored1Ptrs/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs)*
                                pointSpread.scoredNegPtrs/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs-1)*
                                (pointSpread.scoredNegPtrs-1)/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs-2)*
                                (pointSpread.scoredNegPtrs-2)/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs-3);
                        }
                    }
                }
                if(pointSpread.totalScoredPoints == 4 && pointSpread.scoredNegPtrs >=3){
                    //Calc chance that it ends with -1,-1,-1
                            probOfWinPrior +=
                                pointSpread.scoredNegPtrs/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs)*
                                (pointSpread.scoredNegPtrs-1)/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs-1)*
                                (pointSpread.scoredNegPtrs-2)/(pointSpread.posScoredCount+pointSpread.scoredNegPtrs-2);
                }
                }

            //reset the prob per acess
            pointSpread.probPerAccess.length = 0;

            //Intialize probability per access array
            this.probPerAccess = Array(this.size + 1).fill(0);

            //On access zero, the probability will be either 0, or 1 in the case that it is the no-agendas spread
            if(pointSpread.totalScoredCount==0){
                pointSpread.probPerAccess[0]=1;
            }
            else
            {
                pointSpread.probPerAccess[0]=0;
            }


            //These n Choose k calcs are the same regardless of access number, so we can calculate outside of the loop
            const sixCombin = nChoosek(this.six, pointSpread.scored6Ptrs);
            const fourCombin = nChoosek(this.four, pointSpread.scored4Ptrs);
            const threeCombin = nChoosek(this.three, pointSpread.scored3Ptrs);
            const twoCombin = nChoosek(this.two, pointSpread.scored2Ptrs);
            const oneCombin = nChoosek(this.one, pointSpread.scored1Ptrs);
            const zeroCombin = nChoosek(this.zero, pointSpread.scored0Ptrs);
            const negCombin = nChoosek(this.neg, pointSpread.scoredNegPtrs);


            //Start out this single to win at 0%
            pointSpread.hittingDeepDiveSingleToWinPerAccess = Array(this.size+1).fill(0); 

            //Then start calculation loop from last possible access. Starting with last access helps deep dive calculation
            //*** does this break if I go to zero? because right now there should be a way to win after 0 access with deepdive, but it doesnt show it*/
            for (let access = this.size; access >= 1; access--) {
                //If access number is less than the number of agendas, chance is zero
                //Or if the access number is more than the number of scored agendas PLUS non-agendas in the deck, then the chance is zero
                if(access<pointSpread.totalScoredCount || access>(this.non+pointSpread.totalScoredCount)){
                    pointSpread.probPerAccess[access]=0;
                }
                else{
                    const nonCombin = nChoosek(this.non, access-pointSpread.totalScoredCount);
                    //probPerAccess = 
                    //(1-chance we had reached 7 prior and got back below 7 due to negative agendas)
                    // x
                    // Combinatorics math
                    pointSpread.probPerAccess[access] = ((1-probOfWinPrior)*sixCombin*fourCombin*threeCombin*twoCombin*oneCombin*zeroCombin*negCombin*nonCombin/accessCombin[access]);
                }
                //Add the probility of this point spread to the total probability of that point count
                this.pointProbPerAccess[pointSpread.totalScoredPoints+hardLimitNegPtrs][access] += pointSpread.probPerAccess[access];
                //Add the probability of this point spread to the total probability of being AT LEAST that point count;
                for(let points=(0-hardLimitNegPtrs); points<7; points++)
                {
                    if(pointSpread.totalScoredPoints<points){
                    this.atLeastProbPerAccess[points+hardLimitNegPtrs][access]-=pointSpread.probPerAccess[access];
                    }
                }
                //Then we subtract the probability from the win chance (starting at 100%)
                this.haveWonProbPerAccess[access] -= pointSpread.probPerAccess[access];

                //If this is not the last access, we will calculate the chance to win next access from here
                if(access < this.size){
                    let PotentiallyWinningAgendas = 0;
                    //6 Pointer
                    if(pointSpread.totalScoredPoints+6 >= 7){
                        //remaining agendas of this type, diveded by the remaining number of cards
                        PotentiallyWinningAgendas += Math.max(0,this.six - pointSpread.scored6Ptrs);
                    }
                    //4 Pointer
                    if(pointSpread.totalScoredPoints+4 >= 7){
                        //remaining agendas of this type, diveded by the remaining number of cards
                        PotentiallyWinningAgendas += Math.max(0,this.four - pointSpread.scored4Ptrs);
                    }
                    //3 Pointer
                    if(pointSpread.totalScoredPoints+3 >= 7){
                        //remaining agendas of this type, diveded by the remaining number of cards
                        PotentiallyWinningAgendas += Math.max(0,this.three - pointSpread.scored3Ptrs);
                    }
                    //2 Pointer
                    if(pointSpread.totalScoredPoints+2 >= 7){
                        //remaining agendas of this type, diveded by the remaining number of cards
                        PotentiallyWinningAgendas += Math.max(0,this.two - pointSpread.scored2Ptrs);
                    }
                    //1 Pointer
                    if(pointSpread.totalScoredPoints+1 >= 7){
                        //remaining agendas of this type, diveded by the remaining number of cards
                        PotentiallyWinningAgendas += Math.max(0,this.one - pointSpread.scored1Ptrs);
                    }

                    let winFromHereProb = PotentiallyWinningAgendas/(this.size - access);

                    if(PotentiallyWinningAgendas>0){
                        this.winningAgendaCountPossible[pointSpread.nonNegScoredCount+1]=true;
                    }


                    //Overall contribution to win probability is the probability of gettint to this spread on this access...
                    //... times probability that the next agendas wins once we get here
                    let contributionToOverallWinProb = pointSpread.probPerAccess[access]*winFromHereProb;

                    this.probReachWinWithXAgendasPerAccess[pointSpread.totalScoredCount+1][access+1] += contributionToOverallWinProb;
                    this.probReachWinWithXAgendasPerAccess[0][access+1] += contributionToOverallWinProb;
                    
                    this.probReachWinWithXNonNegAgendasPerAccess[pointSpread.nonNegScoredCount+1][access+1] += contributionToOverallWinProb;
                    this.probReachWinWithXNonNegAgendasPerAccess[0][access+1] += contributionToOverallWinProb;


                    //Calculate the chances from winning after this access with a Deep Dive
                    //If the chance of this point spread occuring at this access is 0%, then we dont need to calc
                    if(pointSpread.probPerAccess[access]>0)
                    {
                        //Needed for calculation in the no trash double deep dive
                        let pendingDoubleDive =0;

                        //calculate remaining agendas in deck
                        let remaining6Ptrs = this.six-pointSpread.scored6Ptrs;
                        let remaining4Ptrs = this.four-pointSpread.scored4Ptrs;
                        let remaining3Ptrs = this.three-pointSpread.scored3Ptrs;
                        let remaining2Ptrs = this.two-pointSpread.scored2Ptrs;
                        let remaining1Ptrs = this.one-pointSpread.scored1Ptrs;
                        let remaining0Ptrs = this.zero-pointSpread.scored0Ptrs;
                        let remainingNonAgendas =(this.size-access)-remaining0Ptrs-remaining1Ptrs-remaining2Ptrs-remaining3Ptrs-remaining4Ptrs-remaining6Ptrs;

                        for(const diveSpread of this.deepDiveSpreads)
                        {
                            //Technically, we could cut out some calcs because we only need to calc chance if it's possible to win from 2 agendas.
                            //calculate if this deep dive spread is even possible with this point spread (ie, enough agendas/cards in deck)
                            if(diveSpread.seenNonNegAgendas>(this.size-access) || diveSpread.seen6Ptrs>(remaining6Ptrs) || diveSpread.seen4Ptrs>(remaining4Ptrs) || diveSpread.seen3Ptrs>(remaining3Ptrs) || diveSpread.seen2Ptrs>(remaining2Ptrs) || diveSpread.seen1Ptrs>(remaining1Ptrs)|| diveSpread.seen0Ptrs>(remaining0Ptrs)){
                                //this is an invalid combination so no math done

                            }
                            else{
                                //calculate the probability of pulling this combination from this point
                                    const combinDive6 = nChoosek(remaining6Ptrs, diveSpread.seen6Ptrs);
                                    const combinDive4 = nChoosek(remaining4Ptrs, diveSpread.seen4Ptrs);
                                    const combinDive3 = nChoosek(remaining3Ptrs, diveSpread.seen3Ptrs);
                                    const combinDive2 = nChoosek(remaining2Ptrs, diveSpread.seen2Ptrs);
                                    const combinDive1 = nChoosek(remaining1Ptrs, diveSpread.seen1Ptrs);
                                    const combinDive0 = nChoosek(remaining0Ptrs, diveSpread.seen0Ptrs);
                                    const combinDiveNonAgenda = nChoosek(remainingNonAgendas, Math.min(this.size-access,8)-diveSpread.seenNonNegAgendas);
                                    const combinDiveAccess = nChoosek(this.size-access,Math.min(this.size-access,8));

                                    //Chance of this dive spread occuring from this pointSpread
                                    const diveSpreadChance = combinDive6*combinDive4*combinDive3*combinDive2*combinDive1*combinDive0*combinDiveNonAgenda/combinDiveAccess;

                                    //Total chance of getting to this pointSpread AND THEN getting this dive spread
                                    const combinedDiveSpreadChance = diveSpreadChance *pointSpread.probPerAccess[access];                                    

                                    //If these will cause win, we add the chance to the appropriate array.
                                    if(diveSpread.largestAgenda + pointSpread.totalScoredPoints >= 7){
                                        //We will need to know the single dive win chance from here to calculate the double deep dive chance from other point spreads
                                        //So this does not use the combined dive chance
                                        
                                        pointSpread.hittingDeepDiveSingleToWinPerAccess[access] += diveSpreadChance;

                                        //If the largest agendas will win, they chance is added to all deep dive possibilities
                                        this.totalWinDeepDiveSingleClickPerAccess[access] += combinedDiveSpreadChance;
                                        this.totalWinDeepDiveDoubleClickPerAccess[access] += combinedDiveSpreadChance;
                                        this.totalWinDeepDiveDoubleDiveNoTrashPerAccess[access] += combinedDiveSpreadChance;
                                        this.totalWinDeepDiveDoubleDiveWithTrashPerAccess[access] += combinedDiveSpreadChance;                                    
                                    }else if(diveSpread.largestAgenda + diveSpread.nextLargestAgenda + pointSpread.totalScoredPoints >= 7){
                                        this.totalWinDeepDiveDoubleClickPerAccess[access] += combinedDiveSpreadChance;
                                        this.totalWinDeepDiveDoubleDiveNoTrashPerAccess[access] += combinedDiveSpreadChance;
                                        this.totalWinDeepDiveDoubleDiveWithTrashPerAccess[access] += combinedDiveSpreadChance;   
                                    }
                                    else{
                                        //Calculating chance of winning by using the second click for a second deep dive
                                        //We take the largest agenda from the first deep dive, and see which pointSpread that would take us to.
                                        //The chance of winning is the original dive spread x the chance of winning a deep dive from that progressed point spread
                                        if(diveSpread.largestAgenda==6){
                                            if(pointSpread.proggression6Ptr){
                                                this.totalWinDeepDiveDoubleDiveNoTrashPerAccess[access] += combinedDiveSpreadChance * pointSpread.proggression6Ptr.hittingDeepDiveSingleToWinPerAccess[access+1];
                                                this.totalWinDeepDiveDoubleDiveWithTrashPerAccess[access] += combinedDiveSpreadChance * pointSpread.proggression6Ptr.hittingDeepDiveSingleToWinPerAccess[access+1];
                                            }
                                        } else if(diveSpread.largestAgenda==4){
                                            if(pointSpread.proggression4Ptr){
                                                this.totalWinDeepDiveDoubleDiveNoTrashPerAccess[access] += combinedDiveSpreadChance * pointSpread.proggression4Ptr.hittingDeepDiveSingleToWinPerAccess[access+1];
                                                this.totalWinDeepDiveDoubleDiveWithTrashPerAccess[access] += combinedDiveSpreadChance * pointSpread.proggression4Ptr.hittingDeepDiveSingleToWinPerAccess[access+1];
                                            }
                                        } else if(diveSpread.largestAgenda==3){
                                            if(pointSpread.proggression3Ptr){
                                                this.totalWinDeepDiveDoubleDiveNoTrashPerAccess[access] += combinedDiveSpreadChance * pointSpread.proggression3Ptr.hittingDeepDiveSingleToWinPerAccess[access+1];
                                                this.totalWinDeepDiveDoubleDiveWithTrashPerAccess[access] += combinedDiveSpreadChance * pointSpread.proggression3Ptr.hittingDeepDiveSingleToWinPerAccess[access+1];
                                            }
                                        } else if(diveSpread.largestAgenda==2){
                                            if(pointSpread.proggression2Ptr){
                                                this.totalWinDeepDiveDoubleDiveNoTrashPerAccess[access] += combinedDiveSpreadChance * pointSpread.proggression2Ptr.hittingDeepDiveSingleToWinPerAccess[access+1];
                                                this.totalWinDeepDiveDoubleDiveWithTrashPerAccess[access] += combinedDiveSpreadChance * pointSpread.proggression2Ptr.hittingDeepDiveSingleToWinPerAccess[access+1];
                                            }
                                        } else if(diveSpread.largestAgenda==1){
                                            if(pointSpread.proggression1Ptr){
                                                this.totalWinDeepDiveDoubleDiveNoTrashPerAccess[access] += combinedDiveSpreadChance * pointSpread.proggression1Ptr.hittingDeepDiveSingleToWinPerAccess[access+1];
                                                this.totalWinDeepDiveDoubleDiveWithTrashPerAccess[access] += combinedDiveSpreadChance * pointSpread.proggression1Ptr.hittingDeepDiveSingleToWinPerAccess[access+1];
                                            }
                                        } else if(diveSpread.largestAgenda==0){
                                            if(pointSpread.proggression0Ptr){
                                                this.totalWinDeepDiveDoubleDiveNoTrashPerAccess[access] += combinedDiveSpreadChance * pointSpread.proggression0Ptr.hittingDeepDiveSingleToWinPerAccess[access+1];
                                                this.totalWinDeepDiveDoubleDiveWithTrashPerAccess[access] += combinedDiveSpreadChance * pointSpread.proggression0Ptr.hittingDeepDiveSingleToWinPerAccess[access+1];                                               
                                            }
                                        } else if(diveSpread.largestAgenda==null){
                                            //For the wiff scenarios we need to have the hit chance, but we wont get that till we finish going through the divespreads.
                                            //So we will add the combined dive spread chance, and then once we have completed the diveSpread loop, we will multiply it by the hit chance.
                                                     pendingDoubleDive += combinedDiveSpreadChance;                                  
                                        }
                                    }

                            }
                        }
                        //This is the end of the diveSpread loop, so we know the hit chance for this access now and need to multiply the pending chances by this before adding to accumulation
                        this.totalWinDeepDiveDoubleDiveWithTrashPerAccess[access] += pendingDoubleDive * pointSpread.hittingDeepDiveSingleToWinPerAccess[access+1];
                        this.totalWinDeepDiveDoubleDiveNoTrashPerAccess[access] += pendingDoubleDive * pointSpread.hittingDeepDiveSingleToWinPerAccess[access];                   
                    }
               }


            }

        }

        //The chance to reach win on each access is the increase in the chance to have won
        this.reachWinProbPerAccess = Array(this.size+1).fill(0);
        let averageSum  = 0;
        let notAt50Percent = true; 
        let notAt25Percent = true; 
        let notAt75Percent = true;  
        this.winPopulation.length = 0;      
        for(let access=1; access <= this.size; access++){
            this.reachWinProbPerAccess[access]=this.haveWonProbPerAccess[access]-this.haveWonProbPerAccess[access-1];

            this.haveNotWonProbPerAccess[access] = 1 - this.haveWonProbPerAccess[access];
            
            //Calculate the average
            averageSum += this.reachWinProbPerAccess[access]*access;
            //We want to interpolate the 50% point (median) and the 25% and 75% points
            if(notAt25Percent && this.haveWonProbPerAccess[access]>0.25)
            {
                notAt25Percent=false;
                this.percentile25WinAccess = (access-1) + ( 0.25 - this.haveWonProbPerAccess[access-1])/(this.haveWonProbPerAccess[access]-this.haveWonProbPerAccess[access-1]);
            }
            if(notAt50Percent && this.haveWonProbPerAccess[access]>0.5)
            {
                notAt50Percent=false;
                this.percentile50WinAccess = (access-1) + ( 0.5 - this.haveWonProbPerAccess[access-1])/(this.haveWonProbPerAccess[access]-this.haveWonProbPerAccess[access-1]);            
            }
            if(notAt75Percent && this.haveWonProbPerAccess[access]>0.75)
            {
                notAt75Percent=false;
                this.percentile75WinAccess = (access-1) + ( 0.75 - this.haveWonProbPerAccess[access-1])/(this.haveWonProbPerAccess[access]-this.haveWonProbPerAccess[access-1]);
            }


            for(let agendaCount = 0; agendaCount<=7+hardLimit0Ptrs+(2*hardLimitNegPtrs); agendaCount++){
                this.probWinWithXAgendasPerAccess[agendaCount][access] = this.probWinWithXAgendasPerAccess[agendaCount][access-1]+ this.probReachWinWithXAgendasPerAccess[agendaCount][access];
                if(agendaCount<=7+hardLimit0Ptrs+hardLimitNegPtrs){
                    this.probWinWithXNonNegAgendasPerAccess[agendaCount][access] = this.probWinWithXNonNegAgendasPerAccess[agendaCount][access-1]+ this.probReachWinWithXNonNegAgendasPerAccess[agendaCount][access];
                }
            }
            //Populate the win population
            this.winPopulation.push(...Array(Math.round(this.reachWinProbPerAccess[access]*winPopulationSize)).fill(access));


        //We need to add the have wonChance to the deep dive arrays
        //Since we want the total chance for winning after this access with Deep Dive, we start out at the chance that we have won without deep dive
        this.totalWinDeepDiveSingleClickPerAccess[access] += this.haveWonProbPerAccess[access];
        this.totalWinDeepDiveDoubleClickPerAccess[access] += this.haveWonProbPerAccess[access];
        this.totalWinDeepDiveDoubleDiveNoTrashPerAccess[access] += this.haveWonProbPerAccess[access];
        this.totalWinDeepDiveDoubleDiveWithTrashPerAccess[access] += this.haveWonProbPerAccess[access];

        //calculating probability of being within the Threat 3/4 - Threat 6 range
        this.threat3ProbPerAccess[access] = this.atLeastProbPerAccess[3+hardLimitNegPtrs][access]-this.haveWonProbPerAccess[access];
        this.threat4ProbPerAccess[access] = this.atLeastProbPerAccess[4+hardLimitNegPtrs][access]-this.haveWonProbPerAccess[access];

        }

        this.avgWinAccess = averageSum;

    }
}

class PointSpread {
    
    constructor(scored6Ptrs, scored4Ptrs, scored3Ptrs, scored2Ptrs, scored1Ptrs, scored0Ptrs, scoredNegPtrs) {
        this.scored6Ptrs = scored6Ptrs;
        this.scored4Ptrs = scored4Ptrs;
        this.scored3Ptrs = scored3Ptrs;
        this.scored2Ptrs = scored2Ptrs;
        this.scored1Ptrs = scored1Ptrs;
	    this.scored0Ptrs = scored0Ptrs;
        this.scoredNegPtrs = scoredNegPtrs;

	this.totalScoredCount = scored6Ptrs + scored4Ptrs + scored3Ptrs + scored2Ptrs + scored1Ptrs + scored0Ptrs + scoredNegPtrs;
    this.posScoredCount = scored6Ptrs + scored4Ptrs + scored3Ptrs + scored2Ptrs + scored1Ptrs;
	this.nonNegScoredCount = scored6Ptrs + scored4Ptrs + scored3Ptrs + scored2Ptrs + scored1Ptrs + scored0Ptrs;
	this.totalScoredPoints = scored6Ptrs*6+scored4Ptrs*4+scored3Ptrs*3+scored2Ptrs*2+scored1Ptrs-scoredNegPtrs;
    
    //Will link to point spreads that comes after this if a non negative point is found. Needed for Double Deep Dive calculation
    this.proggression6Ptr = null;
    this.proggression4Ptr = null;
    this.proggression3Ptr = null;
    this.proggression2Ptr = null;
    this.proggression1Ptr = null;
    this.proggression0Ptr = null;

    //Create array for probability per access
    this.probPerAccess = [];

    //We track the total deep dive win chances in the deck, but we need the single win tracked in the point spread as well, to handle double deep dive
    this.hittingDeepDiveSingleToWinPerAccess = []; 
  
    }

    isProgressionFrom(pointSpread, addedAgenda)
    {
        let newScored6Ptrs = pointSpread.scored6Ptrs + (addedAgenda === 6 ? 1: 0);
        let newScored4Ptrs = pointSpread.scored4Ptrs + (addedAgenda === 4 ? 1: 0);
        let newScored3Ptrs = pointSpread.scored3Ptrs + (addedAgenda === 3 ? 1: 0);
        let newScored2Ptrs = pointSpread.scored2Ptrs + (addedAgenda === 2 ? 1: 0);
        let newScored1Ptrs = pointSpread.scored1Ptrs + (addedAgenda === 1 ? 1: 0);
        let newScored0Ptrs = pointSpread.scored0Ptrs + (addedAgenda === 0 ? 1: 0);

        let result =((this.scored6Ptrs === newScored6Ptrs) &&(this.scored4Ptrs === newScored4Ptrs) &&(this.scored3Ptrs === newScored3Ptrs) &&(this.scored2Ptrs === newScored2Ptrs) &&(this.scored1Ptrs === newScored1Ptrs) && (this.scored0Ptrs === newScored0Ptrs) &&(this.scoredNegPtrs === pointSpread.scoredNegPtrs));

        //Return true if progression is true
        return result;

    }
}

class DeepDiveSpread{

    constructor(seen6Ptrs, seen4Ptrs, seen3Ptrs, seen2Ptrs, seen1Ptrs, seen0Ptrs){
        this.seen6Ptrs=seen6Ptrs;
        this.seen4Ptrs=seen4Ptrs;
        this.seen3Ptrs=seen3Ptrs;
        this.seen2Ptrs = seen2Ptrs;
        this.seen1Ptrs = seen1Ptrs;
        this.seen0Ptrs = seen0Ptrs;
        this.largestAgenda = null; //Will be null for non-agenda
        this.nextLargestAgenda = null; //Will be null for non-agenda
        this.seenPosAgendas = seen6Ptrs+seen4Ptrs+seen3Ptrs+seen2Ptrs+seen1Ptrs; //I don't think we will use this
        this.seenNonNegAgendas = seen6Ptrs+seen4Ptrs+seen3Ptrs+seen2Ptrs+seen1Ptrs+seen0Ptrs;
        if(seen0Ptrs>0){
            this.nextLargestAgenda = this.largestAgenda;
            this.largestAgenda = 0;  
            if(seen1Ptrs>1){
            this.nextLargestAgenda = 0;                   
            }                    
        }
        if(seen1Ptrs>0){
            this.nextLargestAgenda = this.largestAgenda;
            this.largestAgenda = 1;  
            if(seen1Ptrs>1){
            this.nextLargestAgenda = 1;                   
            }                    
        }
        if(seen2Ptrs>0){
            this.nextLargestAgenda = this.largestAgenda;
            this.largestAgenda = 2;  
            if(seen2Ptrs>1){
            this.nextLargestAgenda = 2;                   
            }                    
        }
        if(seen3Ptrs>0){
            this.nextLargestAgenda = this.largestAgenda;
            this.largestAgenda = 3;  
            if(seen3Ptrs>1){
            this.nextLargestAgenda = 3;                   
            }                    
        }
        if(seen4Ptrs>0){
            this.nextLargestAgenda = this.largestAgenda;
            this.largestAgenda = 4;  
            if(seen4Ptrs>1){
            this.nextLargestAgenda = 4;                   
            }                    
        }
        if(seen6Ptrs>0){
            this.nextLargestAgenda = this.largestAgenda;
            this.largestAgenda = 6;  
            if(seen6Ptrs>1){
            this.nextLargestAgenda = 6;                   
            }                    
        }                

    }
}


    //Hard Limits are the number of each points that the software allows the user to input
	const hardLimitNegPtrs = 3;
	const hardLimit6Ptrs = 1;
	const hardLimit4Ptrs = 3;
	const hardLimit3Ptrs = 20;
	const hardLimit2Ptrs = 20;
	const hardLimit1Ptrs = 20;
	const hardLimit0Ptrs = 3;

	//Absolute Scored Limit is the maximum number that could be scored BEFORE runner reaches 7
	//Negative and Zero pointers are whatever the hard limits are, as they can always be scored
	const absScoredLimitNegPtrs = hardLimitNegPtrs;
	const absScoredLimit0Ptrs = hardLimit0Ptrs;
	//Positve agendas are based on the number of negative pointers allowed
    const absScoredLimit6Ptrs = Math.floor((6 + hardLimitNegPtrs) / 6);
	const absScoredLimit4Ptrs = Math.floor((6 + hardLimitNegPtrs) / 4);
	const absScoredLimit3Ptrs = Math.floor((6 + hardLimitNegPtrs) / 3);
	const absScoredLimit2Ptrs = Math.floor((6 + hardLimitNegPtrs) / 2);
	const absScoredLimit1Ptrs = Math.floor((6 + hardLimitNegPtrs) / 1);

    const winPopulationSize = 10000;

    const deckColorReservations = [false,false,false,false,false,false,false,false];

    const colorListDecks = ['hsl(120, 100%, 40%)','hsl(180, 100%, 50%)','hsl(260, 80%, 55%)','hsl(50, 100%, 50%)','hsl(350, 90%, 60%)','hsl(25, 100%, 50%)','hsl(210, 90%, 50%)','hsl(300, 80%, 55%)'];
    //Point values -3 to 6
    //const colorListPoints = ['hsl(0, 20%, 45%)','hsl(194, 92%, 42%)','hsl(97, 89%, 48%)','hsl(336, 100%, 79%)','hsl(198, 100%, 24%)','hsl(170, 77%, 44%)','hsl(0, 90%, 60%)','hsl(249, 96%, 48%)','hsl(77, 100%, 50%)','hsl(288, 100%, 49%)'];
    const colorListPoints = [
                            'hsl(236, 94%, 68%)',
                            'hsl(343, 100%, 70%)',
                            'hsl(164, 100%, 40%)',
                            'hsl(269, 94%, 68%)',
                            'hsl(26, 100%, 68%)',
                            'hsl(189, 90%, 53%)',
                            'hsl(42, 99%, 66%)',
                            'hsl(89, 69%, 71%)',
                            'hsl(300, 100%, 80%)',
                            'hsl(9, 85%, 58%)'
                            ];
    //Point values 0 to 13
    //const colorListAgendaCount = ['hsl(120, 100%, 40%)','hsl(180, 100%, 50%)','hsl(300, 80%, 55%)','hsl(50, 100%, 50%)','hsl(330, 90%, 60%)','hsl(25, 100%, 50%)','hsl(210, 90%, 50%)','hsl(260, 80%, 55%)','hsl(50, 100%, 50%)','hsl(0, 0%, 55%)','hsl(0, 0%, 0%)','hsl(210, 90%, 50%)','hsl(260, 80%, 55%)'];
    const colorListAgendaCount = [
     'hsl(0, 0%, 100%)',       
  'hsl(236, 94%, 68%)', // blue
  'hsl(164, 100%, 40%)', // green
  'hsl(26, 100%, 68%)', // orange
  'hsl(269, 94%, 68%)', // purple
  'hsl(42, 99%, 66%)',  // yellow
  'hsl(320, 85%, 60%)', // warm purple/magenta
  'hsl(210, 90%, 55%)', // true blue
  'hsl(0, 85%, 60%)',   // deep red
  'hsl(89, 69%, 71%)',  // lime
  'hsl(343, 100%, 70%)',// pink
  'hsl(9, 85%, 58%)',   // red
  'hsl(300, 100%, 80%)',// magenta
  'hsl(189, 90%, 53%)'  // cyan
];


    const plotlyConfig = {responsive: true,displaylogo: false,modeBarButtonsToRemove: ['toImage','hoverClosestGl2d', 'hoverClosestPie', 'toggleHover', 'toImage', 'sendDataToCloud', 'toggleSpikelines','hoverClosestCartesian','hoverCompareCartesian','select2d', 'lasso2d']};

    let visualsLinked = false;

    let newDeckNumber = 1;
    createRow("Standard",49,"","",2,"",7,"","","","",true);
    createRow("Std w/ LTD",49,"","",2,"",4,3,"","","",true);
    createRow("Mostly 3s",49,"","",6,"",1,"","","","",false);
    createRow("Gross Thule",49,"","","","",4,3,6,"",3,false);
    updateVisuals();
    addRowBtn.addEventListener("click", () => {
        createRow();
        updateVisuals();
    });


