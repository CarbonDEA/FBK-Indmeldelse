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

interface TerminationEmailProps {
  name: string;
  memberNo: number;
  terminationDate: string;
}

export function TerminationEmail({
  name,
  memberNo,
  terminationDate,
}: TerminationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bekræftelse på udmeldelse fra Billardklubben</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Bekræftelse på udmeldelse</Heading>
          
          <Text style={text}>Hej {name},</Text>
          
          <Text style={text}>
            Vi bekræfter hermed din udmeldelse fra Billardklubben.
          </Text>
          
          <Text style={text}>
            Din adgang til klubbens faciliteter er deaktiveret pr. {terminationDate}.
            Din adgangskode vil ikke længere fungere.
          </Text>
          
          <Text style={text}>
            Eventuelle betalingsaftaler er stoppet, og der vil ikke blive foretaget
            yderligere opkrævninger.
          </Text>
          
          <Text style={text}>
            Dit medlemsnummer ({memberNo.toString()}) vil blive arkiveret i henhold til
            gældende regler.
          </Text>
          
          <Text style={text}>
            Tak fordi du har været medlem. Du er altid velkommen tilbage!
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

export default TerminationEmail;

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
