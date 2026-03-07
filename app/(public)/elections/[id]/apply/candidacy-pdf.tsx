import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { CandidacyFormData } from "./types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    textAlign: "center",
    marginBottom: 16,
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  subheading: {
    fontSize: 10,
    color: "#555",
  },

  // Council type section
  formTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 12,
    marginTop: 4,
    letterSpacing: 1,
  },
  councilAndPhotoRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 16,
  },
  councilColumn: {
    flexDirection: "column",
    gap: 6,
    justifyContent: "center",
    flex: 1,
  },
  councilRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: "#333",
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    color: "#fff",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },

  // Photo and candidacy section
  photoAndCandidacyRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 16,
  },
  photoBox: {
    width: 90,
    height: 90,
    borderWidth: 1,
    borderColor: "#999",
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholder: {
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
  photo: {
    width: 88,
    height: 88,
    objectFit: "cover",
  },
  candidacyInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
  },

  // Positions grid
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    marginTop: 8,
  },
  positionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  positionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: "23%",
  },

  // Form fields
  fieldRow: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 12,
  },
  field: {
    flex: 1,
  },
  fieldFull: {
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    color: "#666",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 3,
    minHeight: 18,
  },
  valuePlaceholder: {
    fontSize: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 3,
    minHeight: 18,
    color: "#ccc",
  },

  // Footer / signature
  footer: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  footerBlock: {
    width: "45%",
    alignItems: "center",
  },
  dateValue: {
    fontSize: 12,
    paddingBottom: 3,
    width: "100%",
    textAlign: "center",
  },
  dateBox: {
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    width: "100%",
    minHeight: 40,
    justifyContent: "flex-end",
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    width: "100%",
    minHeight: 40,
  },
  footerLabel: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  declaration: {
    fontSize: 12,
    fontFamily: "Helvetica",
    marginTop: 20,
    marginBottom: 4,
    textAlign: "left",
  },
  noteText: {
    fontSize: 10,
    color: "#666",
    marginTop: 12,
    textAlign: "center",
  },
  blueText: {
    color: "#2563EB",
  },
});

const Checkbox = ({ checked }: { checked: boolean }) => (
  <View style={checked ? styles.checkboxChecked : styles.checkbox}>
    {checked && <Text style={styles.checkmark}>✓</Text>}
  </View>
);

const FormField = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <Text style={value ? styles.value : styles.valuePlaceholder}>
      {value || " "}
    </Text>
  </View>
);

const FullWidthField = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.fieldFull}>
    <Text style={styles.label}>{label}</Text>
    <Text style={value ? styles.value : styles.valuePlaceholder}>
      {value || " "}
    </Text>
  </View>
);

const POSITIONS_LIST = [
  "President",
  "Vice-President",
  "Secretary",
  "Treasurer",
  "Auditor",
  "Senator",
  "Board of Director",
  "Year Level Representative",
];

interface CandidacyPDFProps {
  data: CandidacyFormData;
}

const CandidacyPDF: React.FC<CandidacyPDFProps> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header} fixed>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={styles.logo} src="/useb-logo.png" />
        <Text style={styles.subtitle}>STUDENT ELECTION BOARD</Text>
        <Text style={styles.subtitle}>BAYBAY CAMPUS</Text>
        <Text style={styles.subtitle}>
          {data.faculty
            ? data.faculty.toUpperCase()
            : "UNIVERSITY SUPREME STUDENT COUNCIL"}{" "}
          ELECTION
        </Text>
        <Text style={styles.subheading}>Visayas State University</Text>
        <Text style={styles.subheading}>Visca, Baybay City, Leyte - 6521</Text>
      </View>

      {/* Form Title */}
      <Text style={styles.sectionTitle}>FORM 2. APPLICATION FORM</Text>

      {/* Council Type + Photo side by side */}
      <View style={styles.councilAndPhotoRow}>
        <View style={styles.councilColumn}>
          <View style={styles.checkboxRow}>
            <Checkbox checked={data.councilType === "USSC"} />
            <Text>USSC (University SSC)</Text>
          </View>
          <View style={styles.checkboxRow}>
            <Checkbox checked={data.councilType === "FSSC"} />
            <Text>FSSC (Faculty/College SSC)</Text>
          </View>
        </View>
        <View style={styles.photoBox}>
          {data.photo ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image style={styles.photo} src={data.photo} />
          ) : (
            <Text style={styles.photoPlaceholder}>1x1{"\n"}Photo</Text>
          )}
        </View>
      </View>

      {/* Candidacy Type */}
      <View style={styles.photoAndCandidacyRow}>
        <View style={styles.candidacyInfo}>
          <View style={styles.checkboxRow}>
            <Checkbox checked={data.candidacyType === "Independent"} />
            <Text>Independent Candidate</Text>
          </View>
          <View style={styles.checkboxRow}>
            <Checkbox checked={data.candidacyType === "Political Party"} />
            <Text>Political Party</Text>
          </View>
          {data.candidacyType === "Political Party" && (
            <View style={{ marginTop: 12 }}>
              <View style={styles.fieldRow}>
                <FormField label="Party Name" value={data.partyName} />
              </View>
              <View style={styles.fieldRow}>
                <FormField
                  label="Campaign Manager"
                  value={data.campaignManager}
                />
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Position */}
      <Text style={styles.sectionTitle}>Position</Text>
      <View style={styles.positionsGrid}>
        {POSITIONS_LIST.map((pos) => (
          <View key={pos} style={styles.positionItem}>
            <Checkbox checked={data.position === pos} />
            <Text>{pos}</Text>
          </View>
        ))}
      </View>

      {/* Personal Information */}
      <Text style={styles.sectionTitle}>Personal Information</Text>

      <FullWidthField label="Full Name" value={data.fullName} />

      <View style={styles.fieldRow}>
        <FormField label="Age" value={data.age} />
        <FormField label="Date of Birth" value={data.birthday} />
        <FormField label="Student ID Number" value={data.studentId} />
      </View>

      <FullWidthField label="Current Address" value={data.currentAddress} />
      <FullWidthField label="Permanent Address" value={data.permanentAddress} />

      <View style={styles.fieldRow}>
        <FormField label="Faculty / College" value={data.faculty} />
        <FormField label="Department" value={data.department} />
      </View>

      <View style={styles.fieldRow}>
        <FormField label="Email Address" value={data.email} />
        <FormField label="Contact Number" value={data.contactNumber} />
      </View>

      {/* Declaration */}
      <Text style={[styles.declaration, { fontFamily: "Helvetica-Oblique" }]}>
        (Please attach a copy of your grades in 1st Semester of the current
        academic year)
      </Text>
      <Text style={[styles.declaration, { fontFamily: "Helvetica-Oblique" }]}>
        (Please attach a copy of your COR for 2nd Semester of the current
        academic year)
      </Text>
      <Text style={styles.declaration}>
        By signing this, I have read and understood the guidelines and
        requirements for this election.
      </Text>

      {/* Footer: Date & Signature */}
      <View style={styles.footer}>
        <View style={styles.footerBlock}>
          <View style={styles.dateBox}>
            <Text style={styles.dateValue}>{data.date}</Text>
          </View>
          <Text style={styles.footerLabel}>Date of Filing</Text>
        </View>
        <View style={styles.footerBlock}>
          <View style={styles.signatureLine} />
          <Text style={styles.footerLabel}>Signature over Printed Name</Text>
        </View>
      </View>

      {/* Note */}
      <Text style={styles.noteText}>
        (Note: Please use <Text style={styles.blueText}>blue</Text> colored pen
        for signature)
      </Text>
    </Page>
  </Document>
);

export default CandidacyPDF;
