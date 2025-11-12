# FBK Smart Medlemssystem

Automatisk indmeldelse & udmeldelse - godkendelse via mail. Mail til kommunen og velkomstmail til medlemmet.

Et smart medlemssystem der automatiserer manuelle processer omkring:
- Medlemsregistrering (indmeldelse)
- Medlemsafmelding (udmeldelse)
- Email godkendelsesflow
- Automatisk email til kommunen
- Velkomstmail til nye medlemmer

## Funktioner

✅ **Automatisk medlemsregistrering**
- Validering af medlemsdata (email, telefon, postnummer)
- Automatisk generering af unikke medlems-ID'er
- Sikker datahåndtering

✅ **Email workflow**
- Godkendelsesanmodninger sendes til admin
- Velkomstmail til nye medlemmer
- Bekræftelsesmail ved udmeldelse
- Automatisk notifikation til kommunen

✅ **Dataadministration**
- JSON-baseret datalagring
- Forskellige medlemsstatus (pending, active, cancelled)
- Historik over registreringer og godkendelser

✅ **Sikkerhed og validering**
- Email-validering
- Postnummer-validering (dansk format)
- Telefonnummer-validering
- Unikke godkendelsestokens

## Installation

### Krav
- Python 3.8 eller nyere
- pip (Python package manager)

### Opsætning

1. **Klon repositoriet**
```bash
git clone https://github.com/CarbonDEA/FBK-Indmeldelse.git
cd FBK-Indmeldelse
```

2. **Installer dependencies**
```bash
pip install -r requirements.txt
```

3. **Konfigurer environment variabler**

Kopier eksempel-konfigurationen:
```bash
cp .env.example .env
```

Rediger `.env` filen med dine indstillinger:
```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=din-email@gmail.com
SMTP_PASSWORD=dit-password
SMTP_USE_TLS=True

# Email addresses
APPROVAL_EMAIL=godkendelse@fbk.dk
MUNICIPALITY_EMAIL=kommune@example.dk
ADMIN_EMAIL=admin@fbk.dk

# Organization details
ORG_NAME=FBK
ORG_EMAIL=info@fbk.dk
```

## Brug

### Command-line interface (CLI)

Systemet inkluderer et kommandolinje-interface til alle operationer:

#### Registrer et nyt medlem
```bash
python cli.py register \
  --first-name Anders \
  --last-name Nielsen \
  --email anders@example.dk \
  --phone "+45 12 34 56 78" \
  --address "Hovedgaden 42" \
  --postal-code 2100 \
  --city "København Ø"
```

Dette vil:
1. Validere medlemsdata
2. Oprette en godkendelsesanmodning
3. Sende email til admin med godkendelseslink

#### Godkend en anmodning
```bash
python cli.py approve --token <approval-token>
```

Dette vil:
1. Aktivere medlemmet
2. Sende velkomstmail til medlem
3. Sende notifikation til kommunen

#### Afmeld et medlem
```bash
python cli.py deregister --email anders@example.dk
```

#### Vis alle medlemmer
```bash
python cli.py list
```

#### Vis kun aktive medlemmer
```bash
python cli.py list --status active
```

#### Vis ventende anmodninger
```bash
python cli.py pending
```

#### Hent medlem-detaljer
```bash
python cli.py get --email anders@example.dk
```

### Python API

Du kan også bruge systemet programmatisk:

```python
from fbk_membership.models import Member
from fbk_membership.service import MembershipService

# Initialiser service
service = MembershipService()

# Opret et nyt medlem
member = Member(
    first_name="Anders",
    last_name="Nielsen",
    email="anders@example.dk",
    phone="+45 12 34 56 78",
    address="Hovedgaden 42",
    postal_code="2100",
    city="København Ø"
)

# Anmod om registrering
request = service.request_registration(member)
print(f"Approval token: {request.approval_token}")

# Godkend registrering
approved_member = service.approve_request(request.approval_token)
print(f"Member {approved_member.get_full_name()} is now active")
```

Se `example.py` for et komplet eksempel.

### Kør eksempel

```bash
python example.py
```

Dette kører et komplet eksempel gennem hele workflow'en.

## Email Templates

Systemet sender følgende emails automatisk:

### 1. Godkendelsesanmodning (til admin)
- Sendes når et medlem registrerer sig eller afmelder sig
- Indeholder medlemsoplysninger
- Inkluderer godkendelses- og afvisningslinks

### 2. Velkomstmail (til nyt medlem)
- Sendes når registrering godkendes
- Indeholder medlemsoplysninger og medlems-ID
- Velkomstbesked fra organisationen

### 3. Notifikation til kommune
- Sendes ved godkendt registrering eller afmelding
- Indeholder fulde medlemsoplysninger
- Markeret som automatisk email

### 4. Bekræftelse på afmelding (til medlem)
- Sendes når afmelding godkendes
- Bekræfter at medlemskabet er ophørt

Alle emails er designet med HTML og inkluderer organisationens branding.

## Datastruktur

Medlemsdata gemmes i JSON-format i `members.json`:

```json
{
  "members": [
    {
      "id": "uuid",
      "first_name": "Anders",
      "last_name": "Nielsen",
      "email": "anders@example.dk",
      "phone": "+45 12 34 56 78",
      "address": "Hovedgaden 42",
      "postal_code": "2100",
      "city": "København Ø",
      "status": "active",
      "registration_date": "2025-11-12T10:30:00",
      "approval_date": "2025-11-12T11:00:00"
    }
  ],
  "requests": [...]
}
```

## Projektstuktur

```
FBK-Indmeldelse/
├── fbk_membership/          # Hovedpakke
│   ├── __init__.py
│   ├── models.py            # Data modeller
│   ├── config.py            # Konfiguration
│   ├── storage.py           # Data håndtering
│   ├── email_service.py     # Email håndtering
│   └── service.py           # Hoved service logik
├── cli.py                   # Command-line interface
├── example.py               # Eksempel brug
├── requirements.txt         # Python dependencies
├── .env.example            # Eksempel konfiguration
└── README.md               # Dokumentation
```

## Sikkerhed

- ✅ Email validering med `email-validator`
- ✅ Data validering med Pydantic
- ✅ Unikke godkendelsestokens (UUID)
- ✅ Ingen passwords i koden (bruger environment variabler)
- ✅ .env fil er ekskluderet fra git (.gitignore)

## Udvikling

### Tilføj nye funktioner

Systemet er modulært opbygget:

1. **Tilføj nye felter**: Rediger `models.py`
2. **Tilføj nye email templates**: Rediger `email_service.py`
3. **Tilføj nye CLI kommandoer**: Rediger `cli.py`
4. **Tilføj ny forretningslogik**: Rediger `service.py`

### Test systemet

Kør eksempel-scriptet:
```bash
python example.py
```

Dette vil demonstrere hele workflow'en.

## Fremtidige forbedringer

Potentielle udvidelser:
- [ ] Web interface (Flask/Django)
- [ ] Database backend (PostgreSQL/MySQL)
- [ ] REST API
- [ ] Medlemskort generering (PDF)
- [ ] Betalingsintegration
- [ ] SMS notifikationer
- [ ] Multi-sprog support
- [ ] Avanceret rapportering
- [ ] Integration med regnskabssystemer

## Support

For spørgsmål eller problemer, kontakt:
- Email: info@fbk.dk
- GitHub Issues: https://github.com/CarbonDEA/FBK-Indmeldelse/issues

## Licens

Dette projekt er udviklet til FBK.

## Bidragydere

Udviklet med ❤️ for at automatisere manuelle processer og gøre medlemsadministration nemmere.
