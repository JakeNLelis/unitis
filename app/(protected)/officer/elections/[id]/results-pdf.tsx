import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ArchiveResultsBreakdownProps } from "@/lib/types/components";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
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
  reportTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginTop: 20,
    marginBottom: 4,
    textTransform: "uppercase",
    textAlign: "center",
  },
  electionName: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },

  // Summary Metrics
  summaryBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 24,
    backgroundColor: "#f9fafb",
  },
  summaryCol: {
    flex: 1,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    alignItems: "center",
  },
  summaryColLast: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
  },
  quorumBox: {
    padding: 8,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 4,
    marginBottom: 24,
    alignItems: "center",
  },
  quorumBoxFail: {
    padding: 8,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fef08a",
    borderRadius: 4,
    marginBottom: 24,
    alignItems: "center",
  },
  quorumText: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },

  // Results
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 4,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  positionTitle: {
    fontSize: 10,
    color: "#6b7280",
  },
  voteTotal: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  noResults: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
});

export default function ElectionResultPDF({
  electionName,
  totalVotes,
  expectedVoters,
  turnoutPercentage,
  quorumTarget,
  quorumMet,
  candidateResults,
}: ArchiveResultsBreakdownProps) {
  // Sort candidates by position and then by votes
  const sortedCandidates = [...candidateResults].sort((a, b) => {
    if (a.position_title < b.position_title) return -1;
    if (a.position_title > b.position_title) return 1;
    return b.vote_total - a.vote_total;
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image style={styles.logo} src="/useb-logo.png" />
          <Text style={styles.subtitle}>STUDENT ELECTION BOARD</Text>
          <Text style={styles.subtitle}>BAYBAY CAMPUS</Text>
          <Text style={styles.subheading}>Visayas State University</Text>
          <Text style={styles.subheading}>Visca, Baybay City, Leyte - 6521</Text>
        </View>

        <Text style={styles.reportTitle}>OFFICIAL ELECTION RESULTS</Text>
        <Text style={styles.electionName}>{electionName}</Text>

        <View style={styles.summaryBox}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>TOTAL VOTES CAST</Text>
            <Text style={styles.summaryValue}>{totalVotes}</Text>
          </View>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>EXPECTED VOTERS</Text>
            <Text style={styles.summaryValue}>{expectedVoters ?? "N/A"}</Text>
          </View>
          <View style={styles.summaryColLast}>
            <Text style={styles.summaryLabel}>TURNOUT</Text>
            <Text style={styles.summaryValue}>
              {turnoutPercentage == null ? "N/A" : (expectedVoters === 0 ? "—" : `${turnoutPercentage.toFixed(1)}%`)}
            </Text>
          </View>
        </View>

        <View style={quorumMet === true ? styles.quorumBox : (quorumMet === false ? styles.quorumBoxFail : styles.quorumBox)}>
          <Text style={styles.quorumText}>
            {quorumMet == null ? "QUORUM: N/A" : (quorumMet ? "QUORUM ESTABLISHED" : "QUORUM NOT MET")} ({totalVotes} of {quorumTarget ?? "N/A"} required)
          </Text>
        </View>

        <Text style={styles.sectionTitle}>CANDIDATE RESULTS</Text>
        
        {sortedCandidates.length === 0 ? (
          <Text style={styles.noResults}>No candidate results available.</Text>
        ) : (
          <View>
            {sortedCandidates.map((candidate, index) => (
              <View key={`${candidate.candidate_id}-${index}`} style={styles.resultRow}>
                <View style={styles.candidateInfo}>
                  <Text style={styles.candidateName}>{candidate.full_name}</Text>
                  <Text style={styles.positionTitle}>{candidate.position_title}</Text>
                </View>
                <Text style={styles.voteTotal}>{candidate.vote_total} votes</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated on {new Date().toLocaleString()}
          </Text>
          <Text style={styles.footerText}>
            Student Election Board - Official Record
          </Text>
        </View>
      </Page>
    </Document>
  );
}
