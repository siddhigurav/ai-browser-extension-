// router.js - choose OpenRouter model based on task and user mode
const Router = (function(){
  const MODELS = {
    FAST: 'mistralai/mistral-7b-instruct',
    SMART: 'deepseek/deepseek-chat',
    CODE: 'deepseek/deepseek-coder'
  };

  function chooseModel(task, mode) {
    // task: 'summarize'|'explain'|'rewrite'|'translate'|'code'|'chat'
    mode = (mode || 'FAST').toUpperCase();
    if (task === 'summarize') return MODELS.FAST;
    if (task === 'explain') return MODELS.SMART;
    if (task === 'code' || task === 'coder' || task === 'coding') return MODELS.CODE;
    // default behavior depends on mode
    if (mode === 'SMART') return MODELS.SMART;
    if (mode === 'CODE') return MODELS.CODE;
    return MODELS.FAST;
  }

  return { chooseModel };
})();
