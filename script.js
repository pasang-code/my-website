/* Portfolio Pasang Giatso - JavaScript
   Drie dingen: het jaartal in de footer, secties laten verschijnen
   bij het scrollen, en het contactformulier versturen. */

/* ---------- 1. jaartal in de footer ---------- */
document.getElementById('year').textContent = new Date().getFullYear();


/* ---------- 2. secties laten verschijnen bij het scrollen ----------
   De hero doet dit niet mee: die speelt zijn eigen intro af via CSS,
   zodat de bovenkant van de pagina altijd meteen klaar staat. */

const secties = document.querySelectorAll('main .section');
const minderBeweging = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (minderBeweging) {
  // meteen zichtbaar, zonder animatie
  secties.forEach(function (sectie) {
    sectie.classList.add('is-visible');
  });
} else {
  // .reveal verbergt de sectie, .is-visible laat hem verschijnen
  secties.forEach(function (sectie) {
    sectie.classList.add('reveal');
  });

  const kijker = new IntersectionObserver(function (items) {
    items.forEach(function (item) {
      if (item.isIntersecting) {
        item.target.classList.add('is-visible');
        kijker.unobserve(item.target);   // één keer is genoeg
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  secties.forEach(function (sectie) {
    kijker.observe(sectie);
  });
}


/* ---------- 3. contactformulier ----------
   Het formulier gaat via FormSubmit naar mijn mailbox, dus ik heb
   hiervoor geen eigen server nodig. */

const CONTACT_EMAIL = 'giatsotenzi@gmail.com';

const formulier = document.getElementById('contactForm');
const melding = document.getElementById('contactStatus');
const verstuurKnop = formulier.querySelector('button[type="submit"]');

/* melding onder het formulier tonen: soort 'ok' of 'fout' */
function toonMelding(soort, tekst) {
  melding.hidden = false;
  melding.classList.toggle('contact__status--ok', soort === 'ok');
  melding.classList.toggle('contact__status--err', soort !== 'ok');
  melding.textContent = tekst;
}

formulier.addEventListener('submit', async function (event) {
  event.preventDefault();   // de pagina mag niet herladen

  const naam = formulier.name.value.trim();
  const email = formulier.email.value.trim();
  const bericht = formulier.message.value.trim();

  if (!naam || !email || !bericht || !formulier.email.checkValidity()) {
    toonMelding('fout', 'Vul alsjeblieft je naam, een geldig e-mailadres en een bericht in.');
    return;
  }

  // knop even uitzetten zodat er niet dubbel verstuurd wordt
  const knopTekst = verstuurKnop.textContent;
  verstuurKnop.disabled = true;
  verstuurKnop.textContent = 'Versturen…';

  try {
    const antwoord = await fetch('https://formsubmit.co/ajax/' + CONTACT_EMAIL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: naam,
        email: email,
        message: bericht,
        _subject: 'Bericht via je portfolio — ' + naam,
        _template: 'table',
        _captcha: 'false'
      })
    });

    if (!antwoord.ok) {
      throw new Error('HTTP ' + antwoord.status);
    }

    toonMelding('ok', 'Bedankt, ' + naam + '! Je bericht is verstuurd — ik antwoord meestal binnen een dag.');
    formulier.reset();
  } catch (fout) {
    // vangnet: lukt versturen niet, dan open ik het mailprogramma met het bericht erin
    const onderwerp = 'Bericht via je portfolio - ' + naam;
    const inhoud = 'Naam: ' + naam + '\nE-mail: ' + email + '\n\n' + bericht;

    window.location.href = 'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent(onderwerp) +
      '&body=' + encodeURIComponent(inhoud);

    toonMelding('fout', 'Direct versturen lukte even niet — je mailprogramma opent met het bericht klaar om te versturen.');
  } finally {
    verstuurKnop.disabled = false;
    verstuurKnop.textContent = knopTekst;
  }
});
