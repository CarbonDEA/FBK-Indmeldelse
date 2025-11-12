import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface BoardApprovalEmailProps {
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  notes?: string;
  approveUrl: string;
  rejectUrl: string;
}

export function BoardApprovalEmail({
  applicantName,
  applicantEmail,
  applicantPhone,
  notes,
  approveUrl,
  rejectUrl,
}: BoardApprovalEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Ny indmeldingsanmodning fra {applicantName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Ny indmeldingsanmodning</Heading>
          
          <Text style={text}>
            En ny person ønsker at blive medlem af Billardklubben.
          </Text>
          
          <Section style={infoBox}>
            <Text style={infoLabel}>Navn:</Text>
            <Text style={infoValue}>{applicantName}</Text>
            
            <Text style={infoLabel}>Email:</Text>
            <Text style={infoValue}>{applicantEmail}</Text>
            
            {applicantPhone && (
              <>
                <Text style={infoLabel}>Telefon:</Text>
                <Text style={infoValue}>{applicantPhone}</Text>
              </>
            )}
            
            {notes && (
              <>
                <Text style={infoLabel}>Bemærkninger:</Text>
                <Text style={infoValue}>{notes}</Text>
              </>
            )}
          </Section>
          
          <Text style={text}>
            Klik på en af knapperne nedenfor for at godkende eller afvise ansøgningen:
          </Text>
          
          <Section style={buttonContainer}>
            <Button href={approveUrl} style={approveButton}>
              ✓ Godkend indmeldelse
            </Button>
          </Section>
          
          <Section style={buttonContainer}>
            <Button href={rejectUrl} style={rejectButton}>
              ✗ Afvis ansøgning
            </Button>
          </Section>
          
          <Text style={smallText}>
            Disse links er gyldige i 48 timer og kan kun bruges én gang.
          </Text>
          
          <Text style={footer}>
            Billardklubben - Medlemssystem
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default BoardApprovalEmail;

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

const smallText = {
  color: '#666',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '16px 24px',
  textAlign: 'center' as const,
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

const buttonContainer = {
  margin: '16px 24px',
  textAlign: 'center' as const,
};

const approveButton = {
  backgroundColor: '#28a745',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
};

const rejectButton = {
  backgroundColor: '#dc3545',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
};

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '32px 24px',
  textAlign: 'center' as const,
};
