import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface RejectionEmailProps {
  name: string;
}

export function RejectionEmail({ name }: RejectionEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Vedr. indmeldelse i Billardklubben</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Vedr. indmeldelse i Billardklubben</Heading>
          
          <Text style={text}>Hej {name},</Text>
          
          <Text style={text}>
            Tak for din interesse i at blive medlem af Billardklubben.
          </Text>
          
          <Text style={text}>
            Desværre kan vi ikke godkende din ansøgning på nuværende tidspunkt.
            Dette kan skyldes forskellige årsager, herunder begrænset kapacitet
            eller manglende dokumentation.
          </Text>
          
          <Text style={text}>
            Hvis du har spørgsmål eller ønsker yderligere information, er du
            velkommen til at kontakte os.
          </Text>
          
          <Text style={footer}>
            Venlig hilsen,
            <br />
            Billardklubben
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default RejectionEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 24px',
};

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '32px 24px',
};
