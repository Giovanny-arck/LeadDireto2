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
    // Aplica uma máscara (DD) 9NNNN-NNNN para melhorar a experiência do usuário
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 11); // Limita a 11 dígitos (DDD + número)

    if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    }
    if (value.length > 9) {
      // Formata para (DD) 9NNNN-NNNN
      value = `${value.substring(0, 10)}-${value.substring(10, 14)}`;
    }

    e.target.value = value;
  });
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Pega o valor do WhatsApp e remove a formatação para obter apenas os dígitos
    const whatsappDigits = form.whatsapp.value.replace(/\D/g, '');

    const formData = {
      nome: form.nome.value,
      email: form.email.value,
      // Adiciona o prefixo +55 ao número limpo antes de enviar
      whatsapp: `+55${whatsappDigits}`,
      profissao: form.profissao.value, 
      valor_investimento: form.valor_investimento.value,
      ...capturedUtms 
    };
    
    // A validação agora checa se o número completo (+55 + 11 dígitos) tem 14 caracteres
    if (!formData.nome || !formData.email || !formData.whatsapp || formData.whatsapp.length < 14 || !formData.profissao || !formData.valor_investimento) {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }
    
    submitButton.disabled = true;
    submitButton.textContent = 'ENVIANDO...';
    
    try {
      const webhook1 = fetch('https://n8nwebhook.arck1pro.shop/webhook/lp-lead-direto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const webhook2 = fetch('https://n8nwebhook.arck1pro.shop/webhook/lp-lead-direto-rdmkt', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(formData)
      });
      
      const responses = await Promise.all([webhook1, webhook2]);

      if (responses.every(res => res.ok)) {
        // 🔥 Disparar evento do Meta Pixel
        if (typeof fbq === 'function') {
          fbq('track', 'CompleteRegistration');
        }

      alert('Cadastro realizado com sucesso. Em breve você receberá uma mensagem da nossa equipe!');

        form.reset();

      } else {
        // Identifica qual webhook falhou para facilitar a depuração
        const failedHooks = responses.map((res, i) => !res.ok ? `Webhook ${i+1} (status: ${res.status})` : null).filter(Boolean).join(', ');
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
  // O ID continua no formulário, então começamos por ele
  const formElement = document.getElementById('register-form');
  
  if (formElement) {
    // MODIFICAÇÃO 1: Em vez de rolar para o form, vamos procurar o "pai" dele
    // que tem a classe '.form-container'. Esse é o alvo correto.
    const containerParaRolar = formElement.closest('.form-container');

    if (containerParaRolar) {
      // MODIFICAÇÃO 2: Adicionamos a opção "block: 'center'" para garantir
      // que o container fique bem no meio da tela na vertical.
      containerParaRolar.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

  } else {
    // Se o formulário não for encontrado, rola para o topo da página.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
