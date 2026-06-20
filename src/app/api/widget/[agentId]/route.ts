import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function GET(
  req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  const supabase = createServiceClient()

  const { data: agent } = await supabase
    .from('agents')
    .select('id, name, welcome_message, widget_color')
    .eq('id', params.agentId)
    .single()

  if (!agent) {
    return new NextResponse('// Agent not found', {
      headers: { 'Content-Type': 'application/javascript', ...CORS },
    })
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://raysef.com').replace(/\/+$/, '')

  // Use JSON.stringify for safe JS string injection — prevents XSS
  const agentId = JSON.stringify(agent.id)
  const color = JSON.stringify(agent.widget_color || '#a3e635')
  const name = JSON.stringify(agent.name)
  const welcome = JSON.stringify(agent.welcome_message)
  const appUrlJs = JSON.stringify(appUrl)

  const js = `(function() {
  if (document.getElementById('raysef-widget-root')) return;
  document.getElementById('raysef-widget-root') || document.body.setAttribute('data-raysef', '1');

  var AGENT_ID = ${agentId};
  var APP_URL = ${appUrlJs};
  var COLOR = ${color};
  var NAME = ${name};
  var WELCOME = ${welcome};
  var SK = 'raysef_session_' + AGENT_ID;

  // Persist session across page loads
  var sessionId = sessionStorage.getItem(SK);
  if (!sessionId) {
    sessionId = 'rs_' + Math.random().toString(36).slice(2);
    sessionStorage.setItem(SK, sessionId);
  }

  var isOpen = false;

  var style = document.createElement('style');
  style.textContent = [
    '#raysef-root{position:fixed;bottom:24px;right:24px;z-index:2147483647;font-family:system-ui,sans-serif;}',
    '#raysef-btn{width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.35);transition:transform .2s;background:' + COLOR + ';}',
    '#raysef-btn:hover{transform:scale(1.08);}',
    '#raysef-box{position:absolute;bottom:68px;right:0;width:340px;height:480px;border-radius:16px;border:1px solid #2a2a2a;background:#0a0a0a;display:none;flex-direction:column;box-shadow:0 12px 48px rgba(0,0,0,.6);overflow:hidden;}',
    '@media(max-width:400px){#raysef-box{width:calc(100vw - 32px);right:-8px;}}',
    '#raysef-header{padding:14px 16px;border-bottom:1px solid #1e1e1e;display:flex;align-items:center;justify-content:space-between;}',
    '#raysef-header-left{display:flex;align-items:center;gap:8px;}',
    '#raysef-dot{width:8px;height:8px;border-radius:50%;background:' + COLOR + ';}',
    '#raysef-name{font-size:14px;font-weight:600;color:#fff;}',
    '#raysef-close{background:none;border:none;color:#666;cursor:pointer;font-size:18px;line-height:1;padding:0;}',
    '#raysef-close:hover{color:#fff;}',
    '#raysef-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;}',
    '.rs-msg{max-width:82%;padding:9px 13px;border-radius:14px;font-size:13px;line-height:1.5;word-break:break-word;}',
    '.rs-user{background:' + COLOR + ';color:#000;align-self:flex-end;border-bottom-right-radius:4px;}',
    '.rs-bot{background:#1c1c1c;color:#e5e5e5;align-self:flex-start;border-bottom-left-radius:4px;}',
    '.rs-typing{display:flex;gap:4px;padding:9px 13px;background:#1c1c1c;border-radius:14px;border-bottom-left-radius:4px;align-self:flex-start;}',
    '.rs-dot{width:6px;height:6px;border-radius:50%;background:#555;animation:rsDot 1.2s infinite;}',
    '.rs-dot:nth-child(2){animation-delay:.2s;}.rs-dot:nth-child(3){animation-delay:.4s;}',
    '@keyframes rsDot{0%,80%,100%{transform:scale(0.8)}40%{transform:scale(1.2)}}',
    '#raysef-footer{padding:10px 12px;border-top:1px solid #1e1e1e;display:flex;gap:8px;align-items:center;}',
    '#raysef-input{flex:1;background:#1a1a1a;border:1px solid #2e2e2e;border-radius:10px;padding:8px 12px;color:#fff;font-size:13px;outline:none;font-family:inherit;}',
    '#raysef-input:focus{border-color:' + COLOR + ';}',
    '#raysef-send{background:' + COLOR + ';border:none;border-radius:10px;width:34px;height:34px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
    '#raysef-send:disabled{opacity:.5;cursor:not-allowed;}',
    '#raysef-brand{text-align:center;padding:5px;font-size:10px;color:#333;border-top:1px solid #1a1a1a;}',
    '#raysef-brand a{color:' + COLOR + ';text-decoration:none;}',
  ].join('');
  document.head.appendChild(style);

  var root = document.createElement('div');
  root.id = 'raysef-root';
  root.innerHTML = [
    '<button id="raysef-btn" aria-label="Open support chat">',
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>',
    '</button>',
    '<div id="raysef-box">',
      '<div id="raysef-header">',
        '<div id="raysef-header-left"><div id="raysef-dot"></div><span id="raysef-name">' + NAME + '</span></div>',
        '<button id="raysef-close" aria-label="Close chat">&times;</button>',
      '</div>',
      '<div id="raysef-msgs" role="log" aria-live="polite"></div>',
      '<div id="raysef-footer">',
        '<input id="raysef-input" placeholder="Type a message..." autocomplete="off" aria-label="Message input" />',
        '<button id="raysef-send" aria-label="Send message">',
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="black"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>',
        '</button>',
      '</div>',
      '<div id="raysef-brand">Powered by <a href="https://raysef.com" target="_blank" rel="noopener">Raysef</a></div>',
    '</div>',
  ].join('');
  document.body.appendChild(root);

  var box = document.getElementById('raysef-box');
  var btn = document.getElementById('raysef-btn');
  var msgs = document.getElementById('raysef-msgs');
  var input = document.getElementById('raysef-input');
  var sendBtn = document.getElementById('raysef-send');
  var closeBtn = document.getElementById('raysef-close');

  function addMsg(content, role) {
    var el = document.createElement('div');
    el.className = 'rs-msg ' + (role === 'user' ? 'rs-user' : 'rs-bot');
    el.textContent = content;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    var el = document.createElement('div');
    el.className = 'rs-typing';
    el.id = 'rs-typing';
    el.innerHTML = '<div class="rs-dot"></div><div class="rs-dot"></div><div class="rs-dot"></div>';
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    var t = document.getElementById('rs-typing');
    if (t) t.remove();
  }

  function setOpen(val) {
    isOpen = val;
    box.style.display = val ? 'flex' : 'none';
    if (val && msgs.children.length === 0) addMsg(WELCOME, 'bot');
  }

  async function sendMessage(text) {
    if (!text || !text.trim()) return;
    sendBtn.disabled = true;
    input.value = '';
    addMsg(text, 'user');
    showTyping();

    try {
      var res = await fetch(APP_URL + '/api/chat', {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: AGENT_ID, sessionId: sessionId, message: text, pageUrl: window.location.href }),
      });
      var data = await res.json();
      hideTyping();
      addMsg(data.reply || 'Sorry, something went wrong. Please try again.', 'bot');
    } catch(e) {
      hideTyping();
      addMsg('Could not connect. Please check your connection and try again.', 'bot');
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  btn.addEventListener('click', function() { setOpen(!isOpen); });
  closeBtn.addEventListener('click', function() { setOpen(false); });
  sendBtn.addEventListener('click', function() { sendMessage(input.value); });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); }
  });
})();`

  return new NextResponse(js, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=60',
      ...CORS,
    },
  })
}
