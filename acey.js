const el = {
  introScreen: document.getElementById('introScreen'),
  gameWrap: document.getElementById('gameWrap'),
  startGameBtn: document.getElementById('startGameBtn'),
  playerCount: document.getElementById('playerCount'),
  buyInAmount: document.getElementById('buyInAmount'),
  playerNames: document.getElementById('playerNames'),
  roundNum: document.getElementById('roundNum'),
  potDisplay: document.getElementById('potDisplay'),
  resetBtn: document.getElementById('resetBtn'),
  leftCard: document.getElementById('leftCard'),
  middleCard: document.getElementById('middleCard'),
  rightCard: document.getElementById('rightCard'),
  spreadInfo: document.getElementById('spreadInfo'),
  betButtons: document.querySelectorAll('.bet-btn'),
  customBet: document.getElementById('customBet'),
  setCustomBet: document.getElementById('setCustomBet'),
  dealBtn: document.getElementById('dealBtn'),
  playersList: document.getElementById('playersList'),
  gameLog: document.getElementById('gameLog'),
  tabGameBtn: document.getElementById('tabGameBtn'),
  tabLogBtn: document.getElementById('tabLogBtn'),
  tabGame: document.getElementById('tabGame'),
  tabLog: document.getElementById('tabLog'),
  cashoutOverlay: document.getElementById('cashoutOverlay'),
  cashoutList: document.getElementById('cashoutList'),
  playAgainBtn: document.getElementById('playAgainBtn'),
  resultOverlay: document.getElementById('resultOverlay'),
  resultText: document.getElementById('resultText'),
};

let players = [];
let round = 1;
let pot = 0;
let deck = [];
let leftCard = null;
let rightCard = null;
let middleCard = null;
let selectedBet = null;
let currentPlayerIdx = 0;
let turnsTakenThisRound = 0;
let logEntries = [];

function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const cards = [];
  suits.forEach((suit) => {
    ranks.forEach((rank, idx) => {
      cards.push({ rank, suit, value: idx + 1 });
    });
  });
  return shuffle(cards);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderNameInputs() {
  const count = parseInt(el.playerCount.value, 10) || 1;
  el.playerNames.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 12;
    input.value = `Player ${i + 1}`;
    input.className = 'name-input';
    el.playerNames.appendChild(input);
  }
}

function startGame() {
  const count = Math.max(1, Math.min(12, parseInt(el.playerCount.value, 10) || 1));
  const buyIn = Math.max(0, parseInt(el.buyInAmount.value, 10) || 5);

  const nameInputs = el.playerNames.querySelectorAll('input');
  players = Array.from({ length: count }, (_, i) => ({
    name: (nameInputs[i]?.value || `Player ${i + 1}`).trim(),
    chips: -buyIn,
    bet: null,
    wins: 0,
    losses: 0,
  }));

  pot = buyIn * count;
  el.potDisplay.textContent = pot;
  round = 1;
  selectedBet = null;
  el.roundNum.textContent = round;
  currentPlayerIdx = Math.floor(Math.random() * count);
  turnsTakenThisRound = 0;
  logEntries = [];
  renderLog();

  el.introScreen.style.display = 'none';
  el.gameWrap.style.display = 'block';
  startRound();
}

function startRound() {
  if (pot <= 0) {
    showCashout();
    return;
  }
  deck = createDeck();
  dealEndCards();
  resetBetting();
  turnsTakenThisRound = 0;
  renderPlayers();
}


function allPlayersBroke() {
  return players.every((p) => p.chips <= 0);
}

function dealEndCards() {
  let attempts = 0;
  do {
    leftCard = deck[attempts];
    rightCard = deck[attempts + 1];
    middleCard = deck[attempts + 2];
    attempts++;
  } while (Math.abs(leftCard.value - rightCard.value) <= 1 && attempts < 50);

  if (leftCard.value > rightCard.value) {
    [leftCard, rightCard] = [rightCard, leftCard];
  }

  el.leftCard.textContent = `${leftCard.rank}${leftCard.suit}`;
  el.rightCard.textContent = `${rightCard.rank}${rightCard.suit}`;
  el.middleCard.textContent = '?';
  el.middleCard.classList.add('face-down');
  el.middleCard.classList.remove('revealed');
  const gap = rightCard.value - leftCard.value - 1;
  const betweenCount = gap * 4;
  const totalRemaining = 50; // 52-card deck minus two end cards
  const oddsPct = totalRemaining > 0 ? Math.round((betweenCount / totalRemaining) * 100) : 0;
  el.spreadInfo.textContent = `Winning Numbers: ${leftCard.value + 1} to ${rightCard.value - 1} | Odds: ${oddsPct}% | ${betweenCount}/${totalRemaining}`;
}

function resetBetting() {
  players.forEach((p) => { p.bet = null; });
  selectedBet = null;
  el.dealBtn.disabled = true;
  el.betButtons.forEach((btn) => btn.classList.remove('active'));
  el.customBet.value = '';
  updateBetOptions();
}

function setBet(amount) {
  let betAmount = amount;
  if (betAmount === 'ALL') {
    betAmount = pot;
  }
  if (betAmount === 0) {
    betAmount = 0;
  } else {
    betAmount = Math.max(1, Math.min(betAmount, pot));
  }
  selectedBet = betAmount;
  const player = players[currentPlayerIdx];
  player.bet = betAmount;
  el.dealBtn.disabled = false;
  renderPlayers();
}

function dealCard() {
  if (selectedBet === null) return;

  el.middleCard.textContent = `${middleCard.rank}${middleCard.suit}`;
  el.middleCard.classList.remove('face-down');
  el.middleCard.classList.add('revealed');

  const isBetween = middleCard.value > leftCard.value && middleCard.value < rightCard.value;
  const isEdge = middleCard.value === leftCard.value || middleCard.value === rightCard.value;
  const p = players[currentPlayerIdx];
  const betAmount = selectedBet;
  let outcome = 'NO BET';
  if (p.bet !== null && p.bet !== 0) {
    if (isBetween) {
      p.chips += p.bet;
      pot = Math.max(0, pot - p.bet);
      p.wins += 1;
      outcome = 'WIN';
    } else if (isEdge) {
      p.chips -= (p.bet * 2);
      pot += (p.bet * 2);
      p.losses += 1;
      outcome = 'DEVIL';
    } else {
      p.chips -= p.bet;
      pot += p.bet;
      p.losses += 1;
      outcome = 'LOSE';
    }
  }
  el.potDisplay.textContent = pot;

  logTurn({
    round,
    player: p.name,
    left: `${leftCard.rank}${leftCard.suit}`,
    right: `${rightCard.rank}${rightCard.suit}`,
    middle: `${middleCard.rank}${middleCard.suit}`,
    bet: betAmount ?? 0,
    outcome,
    pot,
    chips: p.chips,
  });

  renderPlayers();
  if (betAmount > 0) {
    if (isBetween) {
      showResultOverlay('🎉 YOU WIN');
    } else if (isEdge) {
      showResultOverlay('😈 THE DEVIL');
    } else {
      showResultOverlay('💀 YOU LOSE');
    }
  }

  setTimeout(() => {
    if (pot <= 0) {
      showCashout();
      return;
    }
    turnsTakenThisRound += 1;
    currentPlayerIdx = (currentPlayerIdx + 1) % players.length;
    if (turnsTakenThisRound >= players.length) {
      round += 1;
      el.roundNum.textContent = round;
      startRound();
    } else {
      // New cards for the next player turn
      deck = createDeck();
      dealEndCards();
      resetBetting();
      el.middleCard.textContent = '?';
      el.middleCard.classList.add('face-down');
      el.middleCard.classList.remove('revealed');
      el.middleCard.textContent = '?';
      renderPlayers();
    }
  }, 4000);
}

function renderPlayers() {
  el.playersList.innerHTML = '';
  players.forEach((p) => {
    const row = document.createElement('div');
    row.className = 'player-row';
    if (players[currentPlayerIdx] === p) {
      row.classList.add('active');
    }
    row.innerHTML = `
      <div class="player-name">${p.name}</div>
      <div class="player-chips">Chips: ${p.chips}</div>
      <div class="player-bet">Bet: ${p.bet === null ? '—' : p.bet}</div>
      <div class="player-wins">Wins: ${p.wins}</div>
      <div class="player-losses">Losses: ${p.losses}</div>
    `;
    el.playersList.appendChild(row);
  });
}

function renderLog() {
  if (!el.gameLog) return;
  if (logEntries.length === 0) {
    el.gameLog.innerHTML = '<div class="log-empty">No turns logged yet.</div>';
    return;
  }
  el.gameLog.innerHTML = logEntries.map((entry, idx) => `
    <div class="log-row">
      <div class="log-idx">#${idx + 1}</div>
      <div class="log-main">
        <div><strong>Round ${entry.round}</strong> — ${entry.player}</div>
        <div>Cards: ${entry.left} | ${entry.middle} | ${entry.right}</div>
        <div>Bet: ${entry.bet} • Outcome: ${entry.outcome} • Chips: ${entry.chips} • Pot: ${entry.pot}</div>
      </div>
    </div>
  `).join('');
}

function logTurn(entry) {
  logEntries.push(entry);
  renderLog();
}

function updateBetOptions() {
  el.customBet.max = pot;
  el.betButtons.forEach((btn) => {
    const betVal = btn.dataset.bet;
    const isAll = betVal === 'ALL';
    const amount = isAll ? pot : parseInt(betVal, 10);
    const disabled = pot <= 0 || amount > pot;
    btn.disabled = disabled;
    btn.classList.toggle('disabled', disabled);
  });
  el.customBet.disabled = pot <= 0;
  el.setCustomBet.disabled = pot <= 0;
  if (pot <= 0) {
    el.dealBtn.disabled = true;
  }
}

function showCashout() {
  el.cashoutList.innerHTML = players.map(p => `<div>${p.name}: ${p.chips}</div>`).join('');
  el.cashoutOverlay.classList.add('show');
}

function showResultOverlay(text) {
  el.resultText.textContent = text;
  if (text.includes('YOU LOSE') || text.includes('THE DEVIL')) {
    el.resultText.setAttribute('data-lose', 'true');
  } else {
    el.resultText.removeAttribute('data-lose');
  }
  el.resultOverlay.classList.add('show');
  setTimeout(() => {
    el.resultOverlay.classList.remove('show');
  }, 900);
}

function resetGame() {
  el.cashoutOverlay.classList.remove('show');
  el.gameWrap.style.display = 'none';
  el.introScreen.style.display = 'flex';
  logEntries = [];
  renderLog();
}

el.playerCount.addEventListener('input', renderNameInputs);
renderNameInputs();

el.startGameBtn.addEventListener('click', startGame);
el.resetBtn.addEventListener('click', resetGame);
el.playAgainBtn.addEventListener('click', resetGame);

el.betButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    el.betButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const betVal = btn.dataset.bet;
    if (betVal === 'ALL') {
      setBet('ALL');
    } else {
      setBet(parseInt(betVal, 10));
    }
  });
});

el.setCustomBet.addEventListener('click', () => {
  const raw = parseInt(el.customBet.value, 10) || 0;
  const amount = raw === 0 ? 0 : Math.max(1, Math.min(raw, pot));
  el.customBet.value = amount;
  setBet(amount);
});

el.dealBtn.addEventListener('click', dealCard);

// Tabs
el.tabGameBtn.addEventListener('click', () => {
  el.tabGameBtn.classList.add('active');
  el.tabLogBtn.classList.remove('active');
  el.tabGame.classList.add('active');
  el.tabLog.classList.remove('active');
});

el.tabLogBtn.addEventListener('click', () => {
  el.tabLogBtn.classList.add('active');
  el.tabGameBtn.classList.remove('active');
  el.tabLog.classList.add('active');
  el.tabGame.classList.remove('active');
});
