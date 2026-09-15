'use client';

import { useEffect } from 'react';

export default function WebhookTrigger() {
  useEffect(() => {
    const fireWebhook = async () => {
      try {
        await fetch('https://api.agents.snsihub.ai/webhook-test/de8d7fb8-def3-4335-ad04-4962e47ec459', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: 'test' }),
        });
        console.log('SNS Workbench Webhook fired automatically! 🚀');
      } catch (error) {
        console.error('Webhook failed to fire:', error);
      }
    };

    fireWebhook();
  }, []); // Fires exactly once when the component loads

  // Returns null because we don't want this to take up any visual space on the screen
  return null; 
}