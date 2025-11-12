import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  name: string;
  memberNo: number;
  doorCode: string;
  infoLinks?: Array<{ title: string; url: string }>;
}

export function WelcomeEmail({
  name,
  memberNo,
  doorCode,
  infoLinks = [],
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Velkommen til Billardklubben – Medlemsnr. {memberNo.toString()}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Velkommen til Billardklubben</Heading>
          
          <Text style={text}>Hej {name},</Text>
          
          <Text style={text}>
            Velkommen som medlem af Billardklubben! Din indmeldelse er godkendt, og
            du har nu adgang til klubbens faciliteter.
          </Text>
          
          <Section style={codeBox}>
            <Text style={codeLabel}>Dit medlemsnummer:</Text>
            <Text style={codeText}>{memberNo.toString()}</Text>
          </Section>
          
          <Section style={codeBox}>
            <Text style={codeLabel}>Din adgangskode til døren:</Text>
            <Text style={codeText}>{doorCode}</Text>
          </Section>
          
          <Text style={text}>
            Opbevar venligst din adgangskode sikkert. Du skal bruge den for at få
            adgang til klubben.
          </Text>
          
          {infoLinks.length > 0 && (
            <>
              <Text style={text}>Nyttige links:</Text>
              {infoLinks.map((link, index) => (
                <Text key={index} style={text}>
                  • <Link href={link.url}>{link.title}</Link>
                </Text>
              ))}
            </>
          )}
          
          <Text style={text}>
            Vi glæder os til at se dig i klubben!
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

export default WelcomeEmail;

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

const codeBox = {
  backgroundColor: '#f4f4f4',
  borderRadius: '4px',
  margin: '16px 24px',
  padding: '24px',
};

const codeLabel = {
  color: '#666',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const codeText = {
  color: '#000',
  fontSize: '32px',
  fontWeight: 'bold',
  letterSpacing: '4px',
  margin: '0',
  fontFamily: 'monospace',
};

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '32px 24px',
};
