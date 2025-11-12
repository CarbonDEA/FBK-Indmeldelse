import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface MunicipalityEmailProps {
  name: string;
  memberNo: number;
  doorCode: string;
  joinedDate: string;
}

export function MunicipalityEmail({
  name,
  memberNo,
  doorCode,
  joinedDate,
}: MunicipalityEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Adgang – {name} (medlemsnr. {memberNo.toString()})</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Ny medlemsadgang</Heading>
          
          <Text style={text}>
            Nyt medlem er godkendt og har fået adgang til billardklubben.
          </Text>
          
          <Section style={infoBox}>
            <Text style={infoLabel}>Navn:</Text>
            <Text style={infoValue}>{name}</Text>
            
            <Text style={infoLabel}>Medlemsnummer:</Text>
            <Text style={infoValue}>{memberNo.toString()}</Text>
            
            <Text style={infoLabel}>Godkendt den:</Text>
            <Text style={infoValue}>{joinedDate}</Text>
            
            <Text style={infoLabel}>Unik adgangskode:</Text>
            <Text style={codeText}>{doorCode}</Text>
          </Section>
          
          <Text style={text}>
            Denne adgangskode er nu aktiv i adgangssystemet.
          </Text>
          
          <Text style={footer}>
            Venlig hilsen,
            <br />
            Billardklubben - Medlemssystem
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default MunicipalityEmail;

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

const infoBox = {
  backgroundColor: '#f4f4f4',
  borderRadius: '4px',
  margin: '16px 24px',
  padding: '24px',
};

const infoLabel = {
  color: '#666',
  fontSize: '12px',
  fontWeight: 'bold',
  margin: '12px 0 4px 0',
  textTransform: 'uppercase' as const,
};

const infoValue = {
  color: '#333',
  fontSize: '16px',
  margin: '0 0 12px 0',
};

const codeText = {
  color: '#000',
  fontSize: '24px',
  fontWeight: 'bold',
  letterSpacing: '2px',
  margin: '0',
  fontFamily: 'monospace',
};

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '32px 24px',
};
