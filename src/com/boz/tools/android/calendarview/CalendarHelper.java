package com.boz.tools.android.calendarview;

import java.util.ArrayList;
import java.util.List;

import org.joda.time.DateTimeConstants;
import org.joda.time.LocalDate;

/**
 * Convenient helper to work with date, JODA DateTime and String
 * 
 * @author thomasdao
 */
public class CalendarHelper {

    /**
     * Retrieve all the dates for a given calendar month Include previous month,
     * current month and next month.
     */
    public static List<LocalDate> getFullWeeks(int month, int year) {
        List<LocalDate> datetimeList = new ArrayList<LocalDate>();

        LocalDate firstDateOfMonth = new LocalDate(year, month, 1);
        LocalDate lastDateOfMonth = firstDateOfMonth.plusMonths(1).minusDays(1);

        // Add dates of first week from previous month
        int weekdayOfFirstDate = firstDateOfMonth.getDayOfWeek();
        while (weekdayOfFirstDate > 0 && weekdayOfFirstDate < 7) {
            LocalDate dateTime = firstDateOfMonth.minusDays(weekdayOfFirstDate);
            datetimeList.add(dateTime);
            weekdayOfFirstDate--;
        }

        // Add dates of current month
        for (int i = 0; i < lastDateOfMonth.getDayOfMonth(); i++) {
            datetimeList.add(firstDateOfMonth.plusDays(i));
        }

        // Add dates of last week from next month
        if (lastDateOfMonth.getDayOfWeek() != DateTimeConstants.SATURDAY) {
            int i = 1;
            while (true) {
                LocalDate nextDay = lastDateOfMonth.plusDays(i);
                datetimeList.add(nextDay);
                i++;
                if (nextDay.getDayOfWeek() == DateTimeConstants.SATURDAY) {
                    break;
                }
            }
        }

        return datetimeList;
    }
}
