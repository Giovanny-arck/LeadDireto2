document.addEventListener('DOMContentLoaded', function() {
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const urlParams = new URLSearchParams(window.location.search);
  const capturedUtms = {};

  utmKeys.forEach(key => {
    if (urlParams.has(key)) {
      capturedUtms[key] = urlParams.get(key);
    }
  });

  const form = document.getElementById('register-form');
  const submitButton = document.getElementById('submit-button');
  
  const whatsappInput = document.querySelector('input[name="whatsapp"]');
  whatsappInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 11); // Limita a 11 dígitos (DDD + número)

    if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    }
    if (value.length > 9) {
      value = `${value.substring(0, 10)}-${value.substring(10, 14)}`;
    }

    e.target.value = value;
  });
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const whatsappDigits = form.whatsapp.value.replace(/\D/g, '');

    // Gera um event_id único (usado no Pixel e na API do Meta)
    const eventId = Date.now().toString() + Math.random().toString(36).substring(2, 10);

    const formData = {
      nome: form.nome.value,
      email: form.email.value,
      whatsapp: `+55${whatsappDigits}`,
      profissao: form.profissao.value, 
      valor_investimento: form.valor_investimento.value,
      event_id: eventId, // <-- Adiciona o event_id no payload
      ...capturedUtms 
    };
    
    if (!formData.nome || !formData.email || !formData.whatsapp || formData.whatsapp.length < 14 || !formData.profissao || !formData.valor_investimento) {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }
    
    submitButton.disabled = true;
    submitButton.textContent = 'ENVIANDO...';
    
    try {
      const response1 = await fetch('https://n8nwebhook.arck1pro.shop/webhook/lp-lead-direto', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const response2 = await fetch('https://n8nwebhook.arck1pro.shop/webhook/lp-lead-direto-rdmkt', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response1.ok && response2.ok) {
        // Disparar evento do Meta Pixel com deduplicação
        if (typeof fbq === 'function') {
          fbq('track', 'CompleteRegistration', {}, { eventID: eventId });
        }

        alert('Cadastro realizado com sucesso. Em breve você receberá uma mensagem da nossa equipe!');
        form.reset();

      } else {
        const failedHooks = [response1, response2]
          .map((res, i) => !res.ok ? `Webhook ${i+1} (status: ${res.status})` : null)
          .filter(Boolean).join(', ');
        throw new Error(`Erro ao enviar formulário. Falha em: ${failedHooks}`);
      }
    } catch (error) {
      alert('Ocorreu um erro ao enviar o cadastro. Tente novamente.');
      console.error(error);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'QUERO ME REGISTRAR';
    }
  });
});

// ===============================================
// FUNÇÃO PARA ROLAGEM DOS BOTÕES DAS NOVAS SEÇÕES
// ===============================================

function scrollToForm() {
  const formElement = document.getElementById('register-form');
  
  if (formElement) {
    const containerParaRolar = formElement.closest('.form-container');
    if (containerParaRolar) {
      containerParaRolar.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
