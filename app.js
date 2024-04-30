// file utils

async function saveToS3(fileName, fileContent) {
  const url = 'https://wf3os2zhvt2n4p3f5hziad6aye0ljanp.lambda-url.us-west-2.on.aws/';
  const data = {
    action: 'saveContext',
    payload: {
      fileName: fileName,
      fileContent: JSON.stringify(fileContent)
    }
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    const responseData = await response.json();
  } catch (error) {
    console.error('Error:', error);
  }
}

async function loadFromS3(fileName) {
  const url = 'https://wf3os2zhvt2n4p3f5hziad6aye0ljanp.lambda-url.us-west-2.on.aws/';
  const data = {
    action: 'loadContext',
    payload: {
      fileName: fileName
    }
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    const responseData = await response.json();
    return JSON.parse(responseData.payload.file_content);
  } catch (error) {
    console.error('Error:', error);
  }
}

// display

window.addEventListener('load', function() {  
  initUI()
  let oakVersion = 'base_concise'  //  0312, base_full, base_concise
  document.querySelector('.sessionForm').value = oakVersion;
  document.querySelector('.loadContext').classList.add('bg-neutral-800');
  uiState.update('sessionForm', oakVersion);
  uiState.toggle('loadContext');

});

function initUI() {
  applyStylesOnLoad()
  initActionUI()
  initTaskUI()
  initDisplayUI()
  initAttrUseUI()
}

function initActionUI() {
  let contextActions = ['saveContext', 'autoSaveContext', 'loadContext', 'appendContext'];
  contextActions.forEach(action => {
    document.querySelector('.' + action).addEventListener('click', function() {
      uiState.toggle(action);
    });
  });
  document.querySelector('.sessionForm').addEventListener('input', function(e) {
    uiState.update('sessionForm', e.target.value);
  });
}

function initTaskUI() {
  let tasks = ['ingestFunction', 'ingestClass', 'createCode', 'updateCode', 'deleteCode', 'chatCode', 'chatUpdate'];
  tasks.forEach(action => {
    document.querySelector('.' + action).addEventListener('click', function() {
      uiState.toggle(action);
    });
  });   
  document.querySelector('.taskForm').addEventListener('input', function(e) {
    uiState.update('taskForm', e.target.value);
  });
}

function initDisplayUI() {
  let tasks = ['displayChat', 'displayElem'];
  tasks.forEach(action => {
    document.querySelector('.' + action).addEventListener('click', function() {
      // console.log('toggling:', action)
      uiState.toggle(action);
    });
  });   
}

function initAttrUseUI() {
  let tasks = ['descriptionAttrUse', 'typeAttrUse', 'inputAttrUse', 'outputAttrUse', 'stepsAttrUse', 'codeAttrUse', 'function_callsAttrUse'];
  tasks.forEach(action => {
    document.querySelector('.' + action).addEventListener('click', function() {
      uiState.toggle(action);
      if (uiState.get(action)) {
        console.log('add attr filter:', action.replace('AttrUse', ''))
        uiState.add('attrFilter', action.replace('AttrUse', ''));
        globalContext.addAttrFilter(action.replace('AttrUse', ''));
      } else {
        console.log('remove attr filter:', action.replace('AttrUse', ''))
        uiState.remove('attrFilter', action.replace('AttrUse', ''));
        globalContext.removeAttrFilter(action.replace('AttrUse', ''));
      }
    });
  });
  tasks.forEach(action => {
    document.querySelector('.' + action).classList.add('bg-neutral-800');
    uiState.toggle(action);
    uiState.add('attrFilter', action.replace('AttrUse', ''));
    globalContext.addAttrFilter(action.replace('AttrUse', ''));
  });   
}

function buildTitleContainer(codeObj) {
  let titleContainer = document.createElement('div');
  titleContainer.className = "flex gap-2"
  let selectObjBtn = document.createElement('button');
  selectObjBtn.className = "text-sm px-2 border border-neutral-700 rounded-md text-neutral-400 bg-neutral-900 hover:bg-neutral-800 focus:outline-none"
  selectObjBtn.textContent = 'sel';
  selectObjBtn.addEventListener('click', function() {
    selectObjBtn.classList.toggle('bg-neutral-800')
    uiState.add('elemSelected', codeObj.name);
  });
  titleContainer.appendChild(selectObjBtn);
  let ctxSelectObjBtn = document.createElement('button');
  ctxSelectObjBtn.className = "text-sm px-2 py-2 border border-neutral-700 rounded-md text-neutral-400 bg-neutral-900 hover:bg-neutral-800 focus:outline-none"
  ctxSelectObjBtn.textContent = 'ctx';
  ctxSelectObjBtn.addEventListener('click', function() {
    ctxSelectObjBtn.classList.toggle('bg-neutral-800')
    uiState.add('ctxElemSelected', codeObj.name);
  });
  titleContainer.appendChild(ctxSelectObjBtn);
  let consoleObjBtn = document.createElement('button');
  consoleObjBtn.className = "text-sm px-2 py-2 border border-neutral-700 rounded-md text-neutral-400 bg-neutral-900 hover:bg-neutral-800 focus:outline-none"
  consoleObjBtn.textContent = 'log';
  consoleObjBtn.addEventListener('click', function() {
    console.log(JSON.stringify(codeObj, null, 2));
  })
  titleContainer.appendChild(consoleObjBtn);  
  let codeObjTitle = document.createElement('div');
  codeObjTitle.className = "text-basetracking-wider ml-2 mt-2 cursor-pointer hover:underline truncate"
  codeObjTitle.textContent = codeObj.name;
  titleContainer.appendChild(codeObjTitle);
  codeObjTitle.addEventListener('click', function() {
    uiState.add('elemToDisplay', codeObj.name);
    uiState.toggle('displayCode');
  });
  return titleContainer;
}

function buildDescriptionContainer(description) {
  let descriptionContainer = document.createElement('div');
  let descriptionTitle = document.createElement('div');
  descriptionTitle.className = "text-lg mt-4 cursor-pointer hover:underline"
  descriptionTitle.textContent = 'Description';
  let descriptionText = document.createElement('div');
  descriptionText.className = "mt-3 hidden"
  descriptionText.textContent = description;
  descriptionTitle.addEventListener('click', function() {
    descriptionText.classList.toggle('hidden');
  }); 
  descriptionContainer.appendChild(descriptionTitle);
  descriptionContainer.appendChild(descriptionText);
  return descriptionContainer;  
}

function buildIOContainer(input, output) {
  let ioContainer = document.createElement('div');
  let ioTitle = document.createElement('div');
  ioTitle.className = "text-lg mt-4 cursor-pointer hover:underline"
  ioTitle.textContent = 'Input/Output';
  ioContainer.appendChild(ioTitle);
  let inputText = document.createElement('p');
  inputText.className = "hidden mt-3"
  inputText.textContent = `Input: ${input}`;
  ioContainer.appendChild(inputText);  
  let outputText = document.createElement('p');
  outputText.className = "hidden mt-3"
  outputText.textContent = `Output: ${output}`;
  ioContainer.appendChild(outputText);
  ioTitle.addEventListener('click', function() {
    inputText.classList.toggle('hidden');
    outputText.classList.toggle('hidden');
  });
  return ioContainer;  
}

function buildDependenciesContainer(functionCalls) {
  let dependenciesContainer = document.createElement('div');
  let dependenciesTitle = document.createElement('div');
  dependenciesTitle.className = "text-lg mt-4 cursor-pointer hover:underline"
  dependenciesTitle.textContent = 'Dependencies';
  let dependenciesList = document.createElement('ul');
  dependenciesList.className = "list-disc list-inside mt-3 hidden"
  functionCalls.forEach(dep => {
    let listItem = document.createElement('li');
    listItem.className = "mt-3"
    listItem.textContent = dep;
    dependenciesList.appendChild(listItem);
  });
  dependenciesTitle.addEventListener('click', function() {
    dependenciesList.classList.toggle('hidden');
  });
  dependenciesContainer.appendChild(dependenciesTitle);
  dependenciesContainer.appendChild(dependenciesList);
  return dependenciesContainer;
}  

function buildStepsContainer(steps) {
  let stepsContainer = document.createElement('div');
  let stepsTitle = document.createElement('div');
  stepsTitle.className = "text-lg mt-4 cursor-pointer hover:underline"
  stepsTitle.textContent = 'Steps';
  let stepsList = document.createElement('ul');
  stepsList.className = "list-disc list-inside mt-3 hidden"
  steps.forEach(step => {
    let listItem = document.createElement('li');
    listItem.className = "mt-3"
    listItem.textContent = step;
    stepsList.appendChild(listItem);
  });
  stepsTitle.addEventListener('click', function() {
    stepsList.classList.toggle('hidden');
  });
  stepsContainer.appendChild(stepsTitle);
  stepsContainer.appendChild(stepsList);
  return stepsContainer;
}

function buildCodeContainer(name, code) {
  let codeContainer = document.createElement('div');
  let titleContainer = document.createElement('div')
  titleContainer.className = "mt-4 flex items-center";
  let codeTitle = document.createElement('span');
  codeTitle.className = "text-lg cursor-pointer hover:underline";
  codeTitle.textContent = 'Code';
  let copyCodeBtn = document.createElement('button');
  copyCodeBtn.className = "ml-4 px-2 py-1 border border-neutral-600 font-medium rounded-md text-neutral-200 bg-neutral-900 hover:bg-neutral-800 focus:outline-none";
  copyCodeBtn.textContent = 'copy';
  copyCodeBtn.addEventListener('click', function() {
    uiState.add('elemCopy', name);
    uiState.toggle('copyCode');
  });
  titleContainer.appendChild(codeTitle); 
  titleContainer.appendChild(copyCodeBtn); 
  let codeBlock = document.createElement('pre');
  codeBlock.className = "bg-neutral-800 rounded mt-3 mb-4 p-4 leading-7 overflow-x-auto";
  let codeContent = document.createElement('code');
  codeContent.textContent = code;
  codeTitle.addEventListener('click', function() {
    codeBlock.classList.toggle('hidden');
  });
  codeBlock.appendChild(codeContent);
  codeContainer.appendChild(titleContainer);
  codeContainer.appendChild(codeBlock);
  return codeContainer;
}

function displayCodeElem(codeObj) {
  let elemContainer = document.createElement('div');
  elemContainer.appendChild(buildTitleContainer(codeObj));
  document.getElementById('elemListDisplay').appendChild(elemContainer);
}

function buildCodeAttr(codeObj) {
  let attrContainer = document.createElement('div');
  if (codeObj.description) {
    attrContainer.appendChild(buildDescriptionContainer(codeObj.description));
  }
  if (codeObj.input && codeObj.output) {
    attrContainer.appendChild(buildIOContainer(codeObj.input, codeObj.output));  
  }
  if (codeObj.function_calls && codeObj.function_calls.length > 0) {
    attrContainer.appendChild(buildDependenciesContainer(codeObj.function_calls));
  }
  if (codeObj.steps) {
    attrContainer.appendChild(buildStepsContainer(codeObj.steps));
  }
  if (codeObj.code) {
    attrContainer.appendChild(buildCodeContainer(codeObj.name, codeObj.code));  
  }
  return attrContainer;
}

function markdownToHtml(markdown) {
  let html = markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
    .replace(/\n/gim, '<br />');

  return html;
}

function displayChatElem(chatObj) {
  uiState.toggle('displayChat');
  let chatContainer = document.querySelector('.chatDisplay');
  let chatElem = document.createElement('div');
  chatElem.className = "mt-4";
  let htmlContent = markdownToHtml(chatObj);
  htmlContent = htmlContent.replace(/\n/g, '<br />');
  chatElem.innerHTML = htmlContent;
  chatContainer.appendChild(chatElem);
}

function refreshTaskUI(context) {
  let taskSelected = document.querySelectorAll('.taskBtn');
  taskSelected.forEach(elem => {
    elem.classList.remove('bg-neutral-800');
  });
  let elemListDisplay = document.getElementById('elemListDisplay');
  elemListDisplay.innerHTML = '';
  context.forEach(contextElem => displayCodeElem(contextElem));
}

function applyStylesOnLoad() {
  let buttons = document.querySelectorAll('.btn');
  buttons.forEach(function(button) {
    button.classList.add('px-3', 'py-2', 'border', 'border-neutral-600', 'font-medium', 'rounded-md', 'text-neutral-200', 'bg-neutral-900', 'hover:bg-neutral-800', 'focus:outline-none');
    button.addEventListener('click', function() {
      button.classList.toggle('bg-neutral-800')
    });
  })
  let inputForms = document.querySelectorAll('.inputForm');
  inputForms.forEach(function(form) {
    form.classList.add('border', 'border-neutral-600', 'rounded-md', 'px-4', 'py-2', 'text-neutral-200', 'bg-neutral-900', 'focus:outline-none', 'focus:border-neutral-400', 'resize-none');
  })
}

// stuff

class UIState {
  constructor() {
    this.actionTriggers = ['saveContext', 'loadContext', 'appendContext', 'autoSaveContext'];
    this.taskTriggers = ['ingestClass', 'ingestFunction', 'createCode', 'updateCode', 'deleteCode', 'chatCode', 'copyCode', 'chatUpdate'];
    this.displayTriggers = ['displayCode', 'displayElem', 'displayChat']
    this.attrUseTriggers = ['descriptionAttrUse', 'typeAttrUse', 'ioAttrUse', 'stepsAttrUse', 'callsAttrUse']
    this.triggers = this.actionTriggers.concat(this.taskTriggers).concat(this.displayTriggers).concat(this.attrUse);
    this.sessionForm = '';
    this.taskForm = '';
    this.elemSelected = [];
    this.elemToDisplay = [];
    this.elemCopy = [];
    this.ctxElemSelected = [];
  }

  get(variable) {
    if (this.hasOwnProperty(variable)) {
      return this[variable];
    }
    return null;
  }

  add(variable, item) {
    if (this.hasOwnProperty(variable) && Array.isArray(this[variable]) && !this[variable].includes(item)) {
      this[variable].push(item);
    }
  }

  remove(variable, item) {
    if (this.hasOwnProperty(variable) && Array.isArray(this[variable])) {
      const index = this[variable].indexOf(item);
      if (index > -1) {
        this[variable].splice(index, 1);
      }
    }
  }

  toggle(variable) {
    // console.log('toggling:', variable)
    if (this.hasOwnProperty(variable)) {
      this[variable] = !this[variable];
    } else {
      this[variable] = true;
    }
    if (this.triggers.includes(variable) && this[variable]) {
      router();
    }
  }

  toggleOff(variable) {
    if (this.hasOwnProperty(variable)) {
      this[variable] = false;
    }
  }  

  update(variable, value) {
    if (this.hasOwnProperty(variable)) {
      this[variable] = value;
    }
  }  
}  

class Context {
  constructor(context = []) {
    // context is a list of code definitions (dicts)
    // each code definition includes a name, description, input, output, steps, code and function_calls
    this.context = context;
    this.contextName = '';
    this.attrFilter = ['name'];
  }
  '//split'
  addAttrFilter(attr) {
    if (!this.attrFilter.includes(attr)) {
      this.attrFilter.push(attr);
    }
  }
  '//split'
  removeAttrFilter(attr) {
    const index = this.attrFilter.indexOf(attr);
    if (index > -1) {
      this.attrFilter.splice(index, 1);
    }
  }
  '//split'
  filterAttr(item) {
    let filteredItem = {};
    this.attrFilter.forEach(attr => {
      filteredItem[attr] = item[attr];
    });
    return filteredItem;
  }
  '//split'
  get() {
    if (this.attrFilter.length > 0) {
      return this.context.map(item => this.filterAttr(item));
    }
    return this.context;
  }
  '//split'
  find(key, value) {
    const filteredContext = this.context.map(item => this.filterAttr(item));
    for (const item of filteredContext) {
      if (item[key] === value) {
        return item;
      }
    }
    return null;
  }
  '//split'
  filter(key, values) {
    let filteredContext = this.context.map(item => this.filterAttr(item));
    filteredContext = filteredContext.filter(item => values.includes(item[key]));
    return filteredContext
  }
  '//split'
  add(item) {
    if (!this.context.includes(item)) {
      this.context.push(item);
    }
  }
  '//split'
  update(key, value, replacement) {
    const index = this.context.findIndex(item => item[key] === value);
    if (index > -1) {
      this.context[index] = replacement;
    } else {
      this.add(replacement);
    }
  }
  '//split'
  load(context, append=false) {
    if (append) {
      this.context = this.context.concat(context);
    } else {
      this.context = context;
    }
  }
  '//split'
  remove(key, value) {
    const index = this.context.findIndex(item => item[key] === value);
    if (index > -1) {
      this.context.splice(index, 1);
    }
  }
}

let globalContext = new Context();
let uiState = new UIState();

async function callLLM(msgs) {
  console.log('calling llm api with:', msgs)
  // I know this shouldn't be here :) 
  const OPENAI_KEY = None
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4-0125-preview", 
      messages: msgs,
      temperature: 0.0,
    }),
  });
  const data = await response.json();
  console.log('llm response:', data.choices[0].message.content)
  return data.choices[0].message.content;
}

async function router() {
  // console.log('router', globalContext)
  // console.log('router', uiState) 

  if (uiState.get('saveContext')) {saveContextHandler()}
  if (uiState.get('loadContext')) {loadContextHandler()}
  if (uiState.get('appendContext')) {appendContextHandler()}
  if (uiState.get('copyCode')) {copyCodeHandler()}
  if (uiState.get('displayCode')) {
    displayElemHandler()
    displayCodeHandler()
  }
  if (uiState.get('displayElem')) {
    displayElemHandler()
    uiState.toggle('displayElem');
  }
  if (uiState.get('displayChat')) {
    displayChatHandler()
    uiState.toggle('displayChat');
  }
  if (uiState.get('ingestFunction')) {
    uiState.toggle('ingestFunction');
    handleIngestCode('function')
  }
  if (uiState.get('ingestClass')) {
    uiState.toggleOff('ingestClass');
    handleIngestCode('class')
  }
  if (uiState.get('createCode')) {
    uiState.toggleOff('createCode');
    handleCreateCode()
  }    
  if (uiState.get('updateCode')) {
    uiState.toggleOff('updateCode');
    handleUpdateCode()
  }    
  if (uiState.get('splitCode')) {handleSplitCode()}    
  if (uiState.get('deleteCode')) {handleDeleteCode()}    
  if (uiState.get('chatCode')) {handleChatCode()}    
  if (uiState.get('chatUpdate')) {handleChatUpdate()}
  if (uiState.get('copyAllCode')) {handleCopyAllCode()}    
  
} 

// session handlers

async function saveContextHandler() {
  saveToS3(`${uiState.get('sessionForm')}.json`, globalContext.get());
  document.querySelector('.saveContext').classList.remove('bg-neutral-800')
  uiState.toggle('saveContext');
}

async function loadContextHandler() {
  let loadedContext = await loadFromS3(`${uiState.get('sessionForm')}.json`);
  document.getElementById('elemListDisplay').innerHTML = '';
  loadedContext.forEach(contextElem => displayCodeElem(contextElem));
  document.querySelector('.loadContext').classList.remove('bg-neutral-800')
  uiState.toggle('loadContext');
  globalContext.load(loadedContext)
}

async function appendContextHandler() {
  let loadedContext = await loadFromS3(`${uiState.get('sessionForm')}.json`);
  globalContext.load(loadedContext, append=true);
  document.querySelector('.appendContext').classList.remove('bg-neutral-800')
  console.log(globalContext.get())
  refreshTaskUI(globalContext.get());
  uiState.toggle('appendContext');
}

// elem handlers

function copyCodeHandler() {
  uiState.get('elemCopy').forEach(elemName => {
    let elem = globalContext.find('name', elemName);
    navigator.clipboard.writeText(elem.code);
  });
  uiState.elemCopy = [];
  uiState.toggle('copyCode');
}

function displayCodeHandler() {
  let elemSelected = uiState.get('elemToDisplay')[0];
  let elem = globalContext.find('name', elemSelected);
  let elemContainer = buildCodeAttr(elem);
  let elemAttrDisplay = document.getElementById('elemAttrDisplay')
  elemAttrDisplay.innerHTML = '';
  elemAttrDisplay.appendChild(elemContainer);
  uiState.elemToDisplay = [];
  uiState.toggle('displayCode');
}

function displayElemHandler() {
  document.querySelector('.displayBtn.displayElem').classList.add('bg-neutral-800')
  document.querySelector('.displayBtn.displayChat').classList.remove('bg-neutral-800')
  document.querySelector('.chatDisplay').classList.add('hidden')
  document.querySelector('.elemAttrDisplay').classList.remove('hidden')
}

function handleDeleteCode() {
  uiState.get('elemSelected').forEach(elemName => {
    globalContext.remove('name', elemName);
  });
  uiState.elemSelected = [];
  uiState.toggle('deleteCode');
  refreshTaskUI(globalContext.get())
}

// ingest

const ingestSysMsg = {
  role: "system",
  content: [
    "As a concise software engineering assistant, your task is to add new text-based code definitions.",
    "These definitions include attributes such as descriptions, types, inputs, outputs, logical steps, code and dependencies.",
    "Initially, you will be given a set of existing code definitions in json as background context.",
    "You will then be given a partial code definition.",
    "Your task is to use this partial definition to construct a full code definition.",
    "The code definition you create should align with the style and structure of the existing definitions, as it will be added to this collection.",
    "Do not write any additional words outside of the code definition.",
    "For example, do not add triple quotes or 'json' at the beginning or end of the definition.",
    "I want to copy paste your answer as is to replace the existing definition",
  ].join('\n')
}  

async function ingestCode(code, context) {
  let contextStr = JSON.stringify(context, null, 2);
  const msgs = [
    ingestSysMsg,
    {role: "user", content: `# CODE DEFINITIONS:\n${contextStr}`},
    createStructMsg('code', code),
  ];
  let newFunc = await callLLM(msgs).then(response => JSON.parse(response));
  return newFunc;
}

function splitCodeHelper(codeType, code) {
  if (!code.includes('//split')) return [code.trim()];
  if (codeType === 'function') {
    return code.split('//split').map(block => block.trim()).filter(block => block);
  }
  if (codeType === 'class') {
    const splits = code.split('//split').map(block => block.trim()).filter(block => block);
    const className = splits.shift();
    return splits.map(block => `${className}\n    ${block}`);
  }
}

async function handleIngestCode(codeType) {
  let ctxElemSelected = uiState.get('ctxElemSelected');
  let userInput = uiState.get('taskForm');
  let codeList = splitCodeHelper(codeType, userInput);
  for (let code of codeList) {
    const existingContext = globalContext.find('code', code.trim());
    if (!existingContext) {
      if (ctxElemSelected.length > 0) {
        let selectedContext = globalContext.filter('name', ctxElemSelected)
        ingestCode(code, selectedContext).then(result => {
          globalContext.add(result);
          refreshTaskUI(globalContext.get());
        });
      } else {
        ingestCode(code, globalContext.get()).then(result => {
          globalContext.add(result);
          refreshTaskUI(globalContext.get());
        });
      }
    } else {
      console.log('code already exists:', existingContext.name)
    }
  }
  uiState.ctxElemSelected = [];
  refreshTaskUI(globalContext.get()); 
}

// create

const createSysMsg = {
  role: "system",
  content: [
    "As a concise software engineering assistant, your task is to add new text-based code definitions.",
    "These definitions include attributes such as descriptions, types, inputs, outputs, logical steps, code and dependencies.",
    "Initially, you will be given a set of existing code definitions in json as background context.",
    "You will then be given a partial code definition.",
    "Your task is to use this partial definition to construct a full code definition.",
    "The code definition you create should align with the style and structure of the existing definitions, as it will be added to this collection.",
    "Do not write any additional words outside of the code definition.",
    "For example, do not add triple quotes or 'json' at the beginning or end of the definition.",
    "I want to copy paste your answer as is to replace the existing definition",
  ].join('\n')
}  

const createStructMsg = (type, partialDefinition) => ({
  role: "user",
  content: [
    `Create a complete ${type} definition, based on the partial definition below:`,
    partialDefinition,
    `The definition should maintain the same style and structure as the set of ${type} provided.`,
    "Please avoid adding extra words, as the generated definition will be directly copied and pasted to replace the existing one."
  ].join('\n')
});

async function createCode(data, context) {
  let userInput = data['userInput'];
  let contextStr = JSON.stringify(context, null, 2);
  const msgs = [
    createSysMsg,
    {role: "user", content: `# CODE DEFINITIONS:\n${contextStr}`},
    createStructMsg('code', userInput),
  ];
  let newFunc = await callLLM(msgs).then(response => JSON.parse(response));
  return newFunc;
}

async function handleCreateCode() {
  let ctxElemSelected = uiState.get('ctxElemSelected');
  data = {userInput: uiState.get('taskForm')};
  let output;
  if (ctxElemSelected.length > 0) {
    let selectedContext = globalContext.filter('name', ctxElemSelected)
    output = await createCode(data, selectedContext);
    document.querySelector('.elemAttrDisplay').textContent = '<-- done'
  } else {
    output = await createCode(data, globalContext.get());
    document.querySelector('.elemAttrDisplay').textContent = '<-- done'
  }
  uiState.ctxElemSelected = [];
  globalContext.add(output);
  refreshTaskUI(globalContext.get())
}

// update

const updateCodeSysMsg = {
  role: "system",
  content: [
    "As a concise software engineering assistant, your task is to revise text-based code definitions.",
    "These definitions include attributes such as descriptions, types, inputs, outputs, logical steps, code and dependencies.",
    "Initially, you will be given a set of existing code definitions in json as background context.",
    "You will then be given a single code definition along with instructions for modifications.",
    "Your task is to rewrite the code definition in accordance with the modification instructions.",
    "Do not write any additional words outside of the code definition.",
    "For example, do not add triple quotes or 'json' at the beginning or end of the definition.",
    "I want to copy paste your answer as is to replace the existing definition",
  ].join('\n')
}

const updateStructMsg = (type, definition, instructions) => ({
  role: "user",
  content: [
    `Please provide a revised version of the following ${type} definition:`,
    definition,
    "Ensure that your revision adheres to these guidelines:",
    instructions,
    "The revised definition should maintain the same style and structure as the original. Please avoid adding extra words, as the revised definition will be directly copied and pasted to replace the existing one."
  ].join('\n')
});

async function updateCode(data, context) {
  let userInput = data['userInput'];
  let elemName = data['elemSelected'];
  let elemLookup = context.find(contextElem => contextElem.name === elemName);
  elemLookup = JSON.stringify(elemLookup, null, 2);
  let contextStr = JSON.stringify(context, null, 2);
  const msgs = [
    updateCodeSysMsg,
    {role: "user", content: `# CODE DEFINITIONS:\n${contextStr}`},
    updateStructMsg('code', elemLookup, userInput),
  ];
  let newFunc = await callLLM(msgs).then(response => JSON.parse(response));
  return newFunc;
}

async function handleUpdateCode() {
  let ctxElemSelected = uiState.get('ctxElemSelected');
  let updatePromises = uiState.get('elemSelected').map(elemSelected => {
    let userInput = uiState.get('taskForm');
    let data = {elemSelected, userInput};
    if (ctxElemSelected.length > 0) {
      let selectedContext = globalContext.filter('name', ctxElemSelected)
      return updateCode(data, selectedContext);
    } else {
      return updateCode(data, globalContext.get());
    }
  });
  const outputs = await Promise.all(updatePromises);
  outputs.forEach((output) => {
    globalContext.update('name', output.name, output);
  });
  uiState.ctxElemSelected = [];
  uiState.elemSelected = [];
  refreshTaskUI(globalContext.get());
}

// refactor

const refactorCodeSysMsg = {
  role: "system",
  content: [
    "A set of code definitions will be provided and the task is either to update the existing definitions or to write new ones that are of better code quality.",
    "This includes ensuring the new or updated definitions maintain clear descriptions, accurate types, inputs, outputs, logical steps, code snippets, and dependencies where applicable.",
    "Each code definition should align with the style and structure of the existing definitions, as it will be directly copied and pasted to replace the existing one.",
    "Please avoid adding extra words outside of the code definition to facilitate a seamless integration process.",
  ].join('\n')
}

const refactorStructMsg = (definitions, instructions) => ({
  role: "user",
  content: [
    `Please refactor the following code definition:`,
    definitions,
    "Ensure that your revision adheres to these guidelines:",
    instructions,
    "The revised definition should maintain the same style and structure as the original. Please avoid adding extra words, as the revised definition will be directly copied and pasted to replace the existing one.",
    "The refactored should be of better code quality, easier to maintain and understand",
  ].join('\n')
});

async function refactorCode(data, context) {
  let userInput = data['userInput'];
  targetElem = JSON.stringify(targetElem, null, 2);
  let contextStr = JSON.stringify(context, null, 2);
  const msgs = [
    refactorCodeSysMsg,
    refactorStructMsg('code', contextStr, userInput),
  ];
  let refinedFunc = await callLLM(msgs).then(response => JSON.parse(response));
  return refinedFunc;
}

async function handleRefactorCode() {
  document.querySelector('.elemAttrDisplay').textContent = 'generating...'
  let ctxElemSelected = uiState.get('ctxElemSelected');
  let data = {userInput: uiState.get('taskForm')};
  let output;
  if (ctxElemSelected.length > 0) {
    let selectedContext = globalContext.filter('name', ctxElemSelected);
    output = await refactorCode(data, selectedContext);
  } else {
    output = await refactorCode(data, globalContext.get());
  }
  uiState.ctxElemSelected = [];
  globalContext.add(output);
  refreshTaskUI(globalContext.get());
  document.querySelector('.elemAttrDisplay').textContent = '<-- done'
}

// chat

const chatCodeSysMsg = {
  role: "system",
  content: [
    "As a concise software engineering assistant, your task is to answer questions based on text-based code definitions.",
    "These definitions include attributes such as descriptions, types, inputs, outputs, logical steps, code and dependencies.",
    "Initially, you will be given a set of existing code definitions in json as background context.",
    "You will then be given be given one or more code definition along with a specific question.",
    "Your task is to answer the question based primarily on the information provided in the code definition.",
    "You should also contextualize your answer based on the background existing code definitions in json.",
  ].join('\n')
}

function displayChatHandler() {
  document.querySelector('.displayBtn.displayChat').classList.add('bg-neutral-800')
  document.querySelector('.displayBtn.displayElem').classList.remove('bg-neutral-800')
  document.querySelector('.elemAttrDisplay').classList.add('hidden')
  document.querySelector('.chatDisplay').classList.remove('hidden')
}

const chatCodeStructMsg = (contextType, def, inst, name = '') => ({
  role: 'user',
  content: [
    `I have a question on the following ${contextType} ${name ? 'element: ' + name : 'context'}:`,
    def,
    '# QUESTION:',
    inst,
  ].join('\n')
});

async function chatCode(data, context) {
  let userInput = data['userInput'];
  let elemName = data['elemSelected'];
  let questionTarget, elemLookup, msgs;
  if (elemName) {
    elemLookup = context.find(contextElem => contextElem.name === elemName);
    questionTarget = JSON.stringify(elemLookup, null, 2);
    msgs = [
      chatCodeSysMsg,
      {role: "user", content: `# CODE DEFINITIONS:\n${questionTarget}`},
      chatCodeStructMsg('code', questionTarget, userInput),
    ];
  } else {
    questionTarget = JSON.stringify(context, null, 2);
    msgs = [
      chatCodeSysMsg,
      chatCodeStructMsg('context', questionTarget, userInput),
    ];
  }
  let llmResponse = await callLLM(msgs).then(response => response);
  return llmResponse;
}

async function handleChatCode() {
  let ctxElemSelected = uiState.get('ctxElemSelected');
  let chatScope;
  if (ctxElemSelected.length > 0) {
    chatScope = globalContext.filter('name', ctxElemSelected);
  } else {
    chatScope = globalContext.get();
  }
  let userInput = uiState.get('taskForm');
  let elemSelected = uiState.get('elemSelected').length > 0 ? uiState.get('elemSelected')[0] : null;
  let data = {userInput, elemSelected};
  let response = await chatCode(data, chatScope);
  uiState.ctxElemSelected = [];
  uiState.elemSelected = [];
  uiState.toggle('chatCode');
  displayChatElem(response);
}

// chat update

const chatUpdateSysMsg = {
  role: "system",
  content: [
    "As a concise software engineering assistant, your task is to answer questions based on text-based code definitions.",
    "These definitions include attributes such as descriptions, types, inputs, outputs, logical steps, code and dependencies.",
    "Initially, you will be given a set of existing code definitions in json as background context.",
    "You will then be given high level instructions for updating these definitions.",
    "Your job is to analyze the code definitions and create a dictionary detailing specific changes for each relevant definition, using the 'name' property as the identifier.",
    "For every definition that needs updates, provide clear, actionable steps on what to modify, add, or remove.",
    "The output should be a JSON dictionary, without any additional words or formatting.",
  ].join('\n')
}

async function chatUpdate(elements, instructions) {
  const elementDefs = elements.map(elem => JSON.stringify(elem, null, 2)).join('\n\n');
  const msgs = [
    chatUpdateSysMsg,
    {
      role: 'user',
      content: [
        '# SELECTED ELEMENTS:',
        elementDefs,
        '# UPDATE INSTRUCTIONS:',
        instructions,
        'Please provide update isntructions for each element.',
      ].join('\n'),
    },
  ];
  const response = await callLLM(msgs);
  return response;
}

async function handleChatUpdate() {
  const selectedElems = uiState.get('elemSelected').map(name => globalContext.find('name', name));
  const instructions = uiState.get('taskForm');
  const response = await chatUpdate(selectedElems, instructions);
  uiState.ctxElemSelected = [];
  uiState.elemSelected = [];
  uiState.toggle('chatUpdate');
  console.log(response);
  displayChatElem(response);
  refreshTaskUI(globalContext.get());
}
