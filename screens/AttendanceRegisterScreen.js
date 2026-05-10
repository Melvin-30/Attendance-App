import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { db } from '../firebase';

import {
  exportMonthlyAttendanceCSV,
  exportAllMonthsAttendanceCSV,
} from '../utils/attendanceExport';

export default function AttendanceRegisterScreen() {
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});

  /* ---------------- NEW: CLASS STATE ---------------- */
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  /* ---------------- DATE FORMAT ---------------- */
  const formatDate = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dates = Array.from({ length: daysInMonth }, (_, i) =>
    formatDate(year, month, i + 1)
  );

  /* ---------------- LOAD CLASSES ---------------- */
  const loadClasses = useCallback(async () => {
    const snap = await db.collection('classes').get();

    let list = snap.docs.map((doc) => doc.data().name);

    list.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    setClasses(list);

    if (!selectedClass && list.length > 0) {
      setSelectedClass(list[0]);
    }
  }, [selectedClass]);

  /* ---------------- LOAD STUDENTS ---------------- */
  const loadStudents = async () => {
    const snap = await db.collection('students').get();

    const list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setStudents(list);
  };

  /* ---------------- OPTIMIZED LOAD ATTENDANCE ---------------- */
  const loadMonthData = useCallback(async () => {
    let data = {};
    const localDays = new Date(year, month + 1, 0).getDate();

    const promises = [];

    for (let i = 1; i <= localDays; i++) {
      const date = formatDate(year, month, i);

      promises.push(
        db
          .collection('attendance')
          .doc(date)
          .get()
          .then((doc) => ({
            date,
            data: doc.exists ? doc.data() : null,
          }))
      );
    }

    const results = await Promise.all(promises);

    results.forEach((r) => {
      if (r.data) {
        data[r.date] = r.data;
      }
    });

    setAttendanceData(data);
  }, [month, year]);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    loadClasses();
    loadStudents();
  }, [loadClasses]);

  useEffect(() => {
    loadMonthData();
  }, [loadMonthData]);

  /* ---------------- FILTER STUDENTS ---------------- */
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => s.class === selectedClass)
      .sort((a, b) => (a.rollNo || 0) - (b.rollNo || 0));
  }, [students, selectedClass]);

  /* ---------------- STATUS ---------------- */
  const getStatus = (studentId, date) => {
    const record = attendanceData?.[date]?.[studentId];

    if (!record) return '—';
    if (record.status === 'Present') return 'P';
    if (record.status === 'Absent') return 'A';

    return '—';
  };

  /* ---------------- TOTALS ---------------- */
  const getTotals = useCallback(
    (date) => {
      let present = 0;
      let absent = 0;

      filteredStudents.forEach((s) => {
        const record = attendanceData?.[date]?.[s.id];
        if (record?.status === 'Present') present++;
        else if (record?.status === 'Absent') absent++;
      });
      return { present, absent };
    },
    [filteredStudents, attendanceData]
  );

  /* ---------------- REPORT GENERATION LOGIC ---------------- */

  /**
   * Export Monthly
   * Generates a single CSV file focusing on the selected month.
   * Useful for quick viewing of a specific academic period.
   */
  const handleExportMonth = async () => {
    try {
      const file = await exportMonthlyAttendanceCSV({
        selectedClass,
        dates,
        filteredStudents,
        getStatus,
        year,
        month,
      });
      Alert.alert('Exported', 'Monthly report saved: ' + file);
    } catch (e) {
      Alert.alert('Error', 'Failed to export monthly report');
    }
  };

  /**
   * Export All Months
   * Aggregates data from all available records in the database.
   * Creates a comprehensive report, often spanning multiple months or the full academic year.
   */
  const handleExportAll = async () => {
    try {
      const file = await exportAllMonthsAttendanceCSV({
        selectedClass,
        students,
        attendanceData,
        getStatus,
      });
      Alert.alert('Exported', 'Full report saved: ' + file);
    } catch (e) {
      Alert.alert('Error', 'Failed to export full report');
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monthly Attendance Register</Text>

      {/* CLASS DROPDOWN */}
      <Text style={styles.label}>Class</Text>

      <TouchableOpacity
        style={styles.dropdownHeader}
        onPress={() => setDropdownOpen(!dropdownOpen)}>
        <Text style={styles.dropdownText}>
          {selectedClass || 'Select Class'}
        </Text>

        <Text style={{ fontSize: 18 }}>{dropdownOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {dropdownOpen && (
        <View style={styles.dropdownList}>
          {classes.map((cls) => (
            <TouchableOpacity
              key={cls}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedClass(cls);
                setDropdownOpen(false);
              }}>
              <Text style={styles.dropdownItemText}>{cls}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <TouchableOpacity style={styles.expBtn} onPress={handleExportMonth}>
        <Text style={styles.expText}>Export Month</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.expBtn} onPress={handleExportAll}>
        <Text style={styles.expText}>Export All Months</Text>
      </TouchableOpacity>
      {/* MONTH NAV */}
      <View style={styles.monthRow}>
        <TouchableOpacity
          onPress={() => {
            if (month === 0) {
              setMonth(11);
              setYear((y) => y - 1);
            } else setMonth((m) => m - 1);
          }}>
          <Text style={styles.nav}>◀</Text>
        </TouchableOpacity>

        <Text style={styles.monthText}>
          {new Date(year, month).toLocaleString('default', {
            month: 'long',
          })}{' '}
          {year}
        </Text>

        <TouchableOpacity
          onPress={() => {
            if (month === 11) {
              setMonth(0);
              setYear((y) => y + 1);
            } else setMonth((m) => m + 1);
          }}>
          <Text style={styles.nav}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* TABLE */}
      <ScrollView>
        <View style={{ flexDirection: 'row' }}>
          {/* LEFT COLUMN */}
          <View>
            <View style={styles.row}>
              <Text style={[styles.cell, styles.snoCol]}>No</Text>
              <Text style={[styles.cell, styles.nameCol]}>Student</Text>
            </View>

            {filteredStudents.map((item, index) => (
              <View key={item.id} style={styles.row}>
                <Text style={[styles.cell, styles.snoCol]}>{index + 1}</Text>
                <Text style={[styles.cell, styles.nameCol]}>{item.name}</Text>
              </View>
            ))}

            <View style={[styles.row, styles.totalRow]}>
              <Text style={[styles.cell, styles.snoCol]} />
              <Text style={[styles.cell, styles.nameCol]}>TOTAL PRESENT</Text>
            </View>

            <View style={[styles.row, styles.totalRow]}>
              <Text style={[styles.cell, styles.snoCol]} />
              <Text style={[styles.cell, styles.nameCol]}>TOTAL ABSENT</Text>
            </View>
          </View>

          {/* RIGHT GRID */}
          <ScrollView horizontal>
            <View>
              <View style={styles.row}>
                {dates.map((date) => (
                  <Text key={date} style={styles.cell}>
                    {date.split('-')[2]}
                  </Text>
                ))}
              </View>

              {filteredStudents.map((item) => (
                <View key={item.id} style={styles.row}>
                  {dates.map((date) => (
                    <Text key={date} style={styles.cell}>
                      {getStatus(item.id, date)}
                    </Text>
                  ))}
                </View>
              ))}

              <View style={[styles.row, styles.totalRow]}>
                {dates.map((date) => {
                  const t = getTotals(date);
                  return (
                    <Text key={date} style={styles.cell}>
                      {t.present}
                    </Text>
                  );
                })}
              </View>

              <View style={[styles.row, styles.totalRow]}>
                {dates.map((date) => {
                  const t = getTotals(date);
                  return (
                    <Text key={date} style={styles.cell}>
                      {t.absent}
                    </Text>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 10,
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center'
  },


  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  nav: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },

  cell: {
    width: 40,
    minWidth: 40,
    textAlign: 'center',
    padding: 5,
    fontSize: 12,
  },

  snoCol: {
    width: 40,
    minWidth: 40,
    fontWeight: 'bold',
  },

  nameCol: {
    width: 120,
    minWidth: 120,
    fontWeight: 'bold',
  },

  totalRow: {
    backgroundColor: '#f2f2f2',
  },

  /* DROPDOWN */
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    marginBottom: 5,
  },

  dropdownText: {
    fontWeight: 'bold',
    color: '#000',
  },

  dropdownList: {
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 10,
  },

  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  dropdownItemText: {
    fontWeight: 'bold',
    color: '#000',
  },
  expBtn: {
    backgroundColor: "#16a34a",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    margin:5
  },

  expText: {
    color: "white",
    fontWeight: "bold"
  },

});
