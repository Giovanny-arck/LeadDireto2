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
  
  // --- ADICIONADO: INICIALIZAÇÃO DO CAMPO DE TELEFONE INTERNACIONAL ---
  const whatsappInput = document.querySelector("#whatsapp");
  const iti = window.intlTelInput(whatsappInput, {
    initialCountry: "auto",
    geoIpLookup: function(callback) {
      fetch("https://ipapi.co/json")
        .then(res => res.json())
        .then(data => callback(data.country_code))
        .catch(() => callback("br")); // Padrão para Brasil em caso de falha
    },
    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
  });
  
  // --- REMOVIDO: O código antigo de máscara de telefone para (XX) XXXXX-XXXX foi retirado ---

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // MODIFICADO: Validação para checar se o número é válido
    if (!iti.isValidNumber()) {
      alert('Por favor, insira um número de telefone válido.');
      return;
    }
    
    // Gera um event_id único (usado no Pixel e na API do Meta)
    const eventId = Date.now().toString() + Math.random().toString(36).substring(2, 10);

    const formData = {
      nome: form.nome.value,
      email: form.email.value,
      // MODIFICADO: Captura o número completo no formato internacional (ex: +5547912345678)
      whatsapp: iti.getNumber(),
      profissao: form.profissao.value, 
      valor_investimento: form.valor_investimento.value,
      event_id: eventId,
      ...capturedUtms 
    };
    
    // REMOVIDA validação antiga de tamanho do telefone
    if (!formData.nome || !formData.email || !formData.profissao || !formData.valor_investimento) {
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
