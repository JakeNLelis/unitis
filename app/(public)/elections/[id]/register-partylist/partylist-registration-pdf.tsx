import React from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { PartylistRegistrationPDFProps } from "@/lib/types/public";
import { POSITIONS } from "@/lib/types/candidacy";

function normalizePositionLabel(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#111",
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 86,
    height: 86,
    marginBottom: 6,
  },
  headingStrong: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    textTransform: "uppercase",
  },
  headingSub: {
    fontSize: 10,
    color: "#444",
    textAlign: "center",
  },
  formTitle: {
    marginTop: 8,
    marginBottom: 10,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  lineRow: {
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    marginBottom: 2,
    fontFamily: "Helvetica-Bold",
  },
  lineValue: {
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    minHeight: 16,
    fontSize: 11,
    paddingBottom: 2,
  },
  note: {
    marginVertical: 6,
    fontFamily: "Helvetica-Oblique",
    fontSize: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: "#333",
    marginTop: 6,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    backgroundColor: "#f3f3f3",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#777",
    minHeight: 24,
  },
  tableCellHeader: {
    padding: 6,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  tableCell: {
    padding: 6,
    fontSize: 10,
  },
  colPosition: {
    width: "30%",
    borderRightWidth: 1,
    borderRightColor: "#333",
  },
  colCandidate: {
    width: "40%",
    borderRightWidth: 1,
    borderRightColor: "#333",
  },
  colProgram: {
    width: "30%",
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    gap: 4,
  },
  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: 8,
    color: "#111",
  },
  fieldRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  field: {
    flex: 1,
  },
  fullField: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    color: "#666",
    marginBottom: 2,
  },
  fieldValue: {
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    minHeight: 16,
    paddingBottom: 2,
    fontSize: 11,
  },
  footer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  footerBlock: {
    width: "48%",
  },
  footerLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    minHeight: 28,
  },
  footerLabel: {
    marginTop: 4,
    fontSize: 9,
    color: "#666",
    textAlign: "center",
    textTransform: "uppercase",
  },
});

function CandidateApplicationPage({
  formData,
}: {
  formData: PartylistRegistrationPDFProps["candidates"][number]["formData"];
}) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={styles.logo} src="/useb-logo.png" />
        <Text style={styles.headingStrong}>Student Election Board</Text>
        <Text style={styles.headingStrong}>Baybay Campus</Text>
        <Text style={styles.headingSub}>Visayas State University</Text>
        <Text style={styles.headingSub}>Visca, Baybay City, Leyte - 6521</Text>
      </View>

      <Text style={styles.formTitle}>Form 2. Application Form</Text>

      <View style={styles.checkboxRow}>
        <View style={styles.checkbox}>
          <Text style={formData.councilType === "USSC" ? styles.checkmark : {}}>
            {formData.councilType === "USSC" ? "X" : ""}
          </Text>
        </View>
        <Text>USSC (University SSC)</Text>
      </View>
      <View style={styles.checkboxRow}>
        <View style={styles.checkbox}>
          <Text style={formData.councilType === "FSSC" ? styles.checkmark : {}}>
            {formData.councilType === "FSSC" ? "X" : ""}
          </Text>
        </View>
        <Text>FSSC (Faculty/College SSC)</Text>
      </View>

      <Text style={styles.sectionTitle}>Position</Text>
      {POSITIONS.map((position) => (
        <View key={position} style={styles.checkboxRow}>
          <View style={styles.checkbox}>
            <Text
              style={
                normalizePositionLabel(formData.position) ===
                normalizePositionLabel(position)
                  ? styles.checkmark
                  : {}
              }
            >
              {normalizePositionLabel(formData.position) ===
              normalizePositionLabel(position)
                ? "X"
                : ""}
            </Text>
          </View>
          <Text>{position}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Personal Information</Text>

      <View style={styles.fullField}>
        <Text style={styles.fieldLabel}>Full Name</Text>
        <Text style={styles.fieldValue}>{formData.fullName || " "}</Text>
      </View>

      <View style={styles.fieldRow}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Age</Text>
          <Text style={styles.fieldValue}>{formData.age || " "}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Date of Birth</Text>
          <Text style={styles.fieldValue}>{formData.birthday || " "}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Student ID</Text>
          <Text style={styles.fieldValue}>{formData.studentId || " "}</Text>
        </View>
      </View>

      <View style={styles.fullField}>
        <Text style={styles.fieldLabel}>Current Address</Text>
        <Text style={styles.fieldValue}>{formData.currentAddress || " "}</Text>
      </View>

      <View style={styles.fullField}>
        <Text style={styles.fieldLabel}>Permanent Address</Text>
        <Text style={styles.fieldValue}>
          {formData.permanentAddress || " "}
        </Text>
      </View>

      <View style={styles.fieldRow}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Faculty</Text>
          <Text style={styles.fieldValue}>{formData.faculty || " "}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Department</Text>
          <Text style={styles.fieldValue}>{formData.department || " "}</Text>
        </View>
      </View>

      <View style={styles.fieldRow}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Email</Text>
          <Text style={styles.fieldValue}>{formData.email || " "}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Contact Number</Text>
          <Text style={styles.fieldValue}>{formData.contactNumber || " "}</Text>
        </View>
      </View>

      <View style={styles.fieldRow}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Party Name</Text>
          <Text style={styles.fieldValue}>{formData.partyName || " "}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Campaign Manager</Text>
          <Text style={styles.fieldValue}>
            {formData.campaignManager || " "}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerBlock}>
          <View style={styles.footerLine} />
          <Text style={styles.footerLabel}>Date of Filing</Text>
        </View>
        <View style={styles.footerBlock}>
          <View style={styles.footerLine} />
          <Text style={styles.footerLabel}>Signature over Printed Name</Text>
        </View>
      </View>
    </Page>
  );
}

export default function PartylistRegistrationPDF({
  electionName,
  partylistName,
  managerName,
  candidates,
}: PartylistRegistrationPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image style={styles.logo} src="/useb-logo.png" />
          <Text style={styles.headingStrong}>Student Election Board</Text>
          <Text style={styles.headingStrong}>Baybay Campus</Text>
          <Text style={styles.headingStrong}>
            Faculty of Natural and Mathematical Sciences
          </Text>
          <Text style={styles.headingSub}>Visayas State University</Text>
          <Text style={styles.headingSub}>
            Visca, Baybay City, Leyte - 6521
          </Text>
        </View>

        <Text style={styles.formTitle}>
          Form 1. Faculty Supreme Student Council
        </Text>

        <View style={styles.lineRow}>
          <Text style={styles.label}>Name of Party:</Text>
          <Text style={styles.lineValue}>{partylistName}</Text>
        </View>
        <View style={styles.lineRow}>
          <Text style={styles.label}>Campaign Manager:</Text>
          <Text style={styles.lineValue}>{managerName}</Text>
        </View>

        <Text style={styles.note}>
          (Please attach your discussed programs and platforms.)
        </Text>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <View style={styles.colPosition}>
              <Text style={styles.tableCellHeader}>Position</Text>
            </View>
            <View style={styles.colCandidate}>
              <Text style={styles.tableCellHeader}>Name of Candidate</Text>
            </View>
            <View style={styles.colProgram}>
              <Text style={styles.tableCellHeader}>Degree Program</Text>
            </View>
          </View>

          {candidates.map((candidate, index) => (
            <View
              key={`${candidate.position}-${candidate.fullName}-${index}`}
              style={styles.tableRow}
            >
              <View style={styles.colPosition}>
                <Text style={styles.tableCell}>{candidate.position}</Text>
              </View>
              <View style={styles.colCandidate}>
                <Text style={styles.tableCell}>{candidate.fullName}</Text>
              </View>
              <View style={styles.colProgram}>
                <Text style={styles.tableCell}>{candidate.degreeProgram}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.note, { marginTop: 12 }]}>
          Election: {electionName}
        </Text>
      </Page>

      {candidates.map((candidate, index) => (
        <CandidateApplicationPage
          key={`${candidate.fullName}-${candidate.position}-${index}`}
          formData={candidate.formData}
        />
      ))}
    </Document>
  );
}
