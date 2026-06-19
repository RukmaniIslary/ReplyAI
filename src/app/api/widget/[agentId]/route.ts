import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: agent } = await supabase
    .from('agents')
    .select('id, name, welcome_message, widget_color')
    .eq('id', params.agentId)
    .single()

  if (!agent) {
    return new NextResponse('// Agent not found', { headers: { 'Content-Type': 'application/javascript' } })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://raysef.io'
  const color = agent.widget_color || '#a3e635'
  const name = agent.name.replace(/'/g, "\\'")
  const welcome = agent.welcome_message.replace(/'/g, "\\'")

  const js = `
(function() {
  if (document.getElementById('raysef-widget-root')) return;

  var AGENT_ID = '${agent.id}';
  var APP_URL = '${appUrl}';
  var COLOR = '${color}';
  var NAME = '${name}';
  var WELCOME = '${welcome}';

  var sessionId = 'rs_' + Math.random().toString(36).slice(2);
  var open = false;
  var messages = [];

  // Inject styles
  var style = document.createElement('style');
  style.textContent = [
    '#raysef-btn { position:fixed;bottom:24px;right:24px;z-index:9999;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.3);transition:transform .2s; }',
    '#raysef-btn:hover { transform:scale(1.05); }',
    '#raysef-box { position:fixed;bottom:96px;right:24px;z-index:9999;width:360px;height:500px;border-radius:16px;border:1px solid #333;background:#0a0a0a;display:flex;flex-direction:column;box-shadow:0 8px 40px rgba(0,0,0,.5);overflow:hidden; }',
    '#raysef-header { padding:16px;border-bottom:1px solid #222;display:flex;align-items:center;gap:10px; }',
    '#raysef-header-dot { width:8px;height:8px;border-radius:50%;background:' + COLOR + '; }',
    '#raysef-header-name { font-size:14px;font-weight:600;color:#fff;font-family:system-ui; }',
    '#raysef-msgs { flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px; }',
    '.rs-msg { max-width:80%;padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.5;font-family:system-ui; }',
    '.rs-user { background:' + COLOR + ';color:#000;align-self:flex-end;border-bottom-right-radius:4px; }',
    '.rs-bot { background:#1a1a1a;color:#e5e5e5;align-self:flex-start;border-bottom-left-radius:4px; }',
    '.rs-typing { display:flex;gap:4px;padding:10px 14px;background:#1a1a1a;border-radius:12px;border-bottom-left-radius:4px;align-self:flex-start; }',
    '.rs-dot { width:6px;height:6px;border-radius:50%;background:#555;animation:rsDot 1.2s infinite; }',
    '.rs-dot:nth-child(2){animation-delay:.2s;} .rs-dot:nth-child(3){animation-delay:.4s;}',
    '@keyframes rsDot{0%,80%,100%{transform:scale(0.8)}40%{transform:scale(1.2)}}',
    '#raysef-input-row { padding:12px;border-top:1px solid #222;display:flex;gap:8px; }',
    '#raysef-input { flex:1;background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:8px 12px;color:#fff;font-size:13px;outline:none;font-family:system-ui; }',
    '#raysef-input:focus { border-color:' + COLOR + '; }',
    '#raysef-send { background:' + COLOR + ';border:none;border-radius:8px;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0; }',
    '#raysef-brand { text-align:center;padding:6px;font-size:10px;color:#444;font-family:system-ui; }',
  ].join('');
  document.head.appendChild(style);

  // Toggle button
  var btn = document.createElement('button');
  btn.id = 'raysef-btn';
  btn.style.background = COLOR;
  btn.setAttribute('aria-label', 'Open support chat');
  btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
  document.body.appendChild(btn);

  // Chat box
  var box = document.createElement('div');
  box.id = 'raysef-box';
  box.style.display = 'none';
  box.innerHTML = [
    '<div id="raysef-header"><div id="raysef-header-dot"></div><span id="raysef-header-name">' + NAME + '</span></div>',
    '<div id="raysef-msgs"></div>',
    '<div id="raysef-input-row"><input id="raysef-input" placeholder="Type a message..." /><button id="raysef-send" aria-label="Send"><svg width="16" height="16" viewBox="0 0 24 24" fill="black"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg></button></div>',
    '<div id="raysef-brand">Powered by <a href="https://raysef.io" target="_blank" style="color:#a3e635;text-decoration:none;">Raysef</a></div>',
  ].join('');
  document.body.appendChild(box);

  function addMsg(content, role) {
    var msgs = document.getElementById('raysef-msgs');
    var el = document.createElement('div');
    el.className = 'rs-msg ' + (role === 'user' ? 'rs-user' : 'rs-bot');
    el.textContent = content;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  function showTyping() {
    var msgs = document.getElementById('raysef-msgs');
    var el = document.createElement('div');
    el.className = 'rs-typing';
    el.id = 'rs-typing';
    el.innerHTML = '<div class="rs-dot"></div><div class="rs-dot"></div><div class="rs-dot"></div>';
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById('rs-typing');
    if (el) el.remove();
  }

  async function sendMessage(text) {
    if (!text.trim()) return;
    addMsg(text, 'user');
    document.getElementById('raysef-input').value = '';
    showTyping();

    try {
      var res = await fetch(APP_URL + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: AGENT_ID, sessionId: sessionId, message: text, pageUrl: window.location.href }),
      });
      var data = await res.json();
      hideTyping();
      addMsg(data.reply || 'Sorry, something went wrong.', 'bot');
    } catch(e) {
      hideTyping();
      addMsg('Connection error. Please try again.', 'bot');
    }
  }

  // Show welcome message when opened
  btn.addEventListener('click', function() {
    open = !open;
    box.style.display = open ? 'flex' : 'none';
    box.style.flexDirection = 'column';
    if (open && document.getElementById('raysef-msgs').children.length === 0) {
      addMsg(WELCOME, 'bot');
    }
  });

  document.getElementById('raysef-send').addEventListener('click', function() {
    sendMessage(document.getElementById('raysef-input').value);
  });

  document.getElementById('raysef-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendMessage(this.value);
  });
})();
`

  return new NextResponse(js, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
