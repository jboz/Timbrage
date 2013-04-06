package com.boz.tools.android.timbrage;

import java.io.File;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

import org.joda.time.Duration;
import org.joda.time.LocalDate;
import org.joda.time.LocalDateTime;
import org.joda.time.Period;
import org.joda.time.Seconds;
import org.joda.time.format.PeriodFormatter;
import org.joda.time.format.PeriodFormatterBuilder;

import com.google.common.base.Predicate;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.collect.Ordering;

public class TimeReport {
    private static final PeriodFormatter formatter = new PeriodFormatterBuilder().minimumPrintedDigits(2)
            .printZeroAlways().appendHours().appendSuffix("h").minimumPrintedDigits(2).printZeroAlways()
            .appendMinutes().toFormatter();

    public static Period calculateTimes(final Iterable<LocalDateTime> times) {
        // sort asc times
        final List<LocalDateTime> ordered = Ordering.natural().sortedCopy(times);

        int cpt = 1;
        Duration total = Duration.ZERO;
        LocalDateTime previous = null;
        for (final LocalDateTime time : ordered) {
            if (cpt == 2) {
                final Seconds elapsed = Seconds.secondsBetween(previous, time);
                total = total.plus(elapsed.toStandardDuration());
                cpt = 0;
            }
            previous = time;
            cpt++;
        }
        return total.toPeriod();
    }

    public static Period calculateElapsed(final Iterable<LocalDateTime> times) {

        final List<LocalDateTime> times2 = Lists.newArrayList(Iterables.filter(times,
                new LocalDatePredicate(LocalDate.now())));
        // si timbrages impaire, on en ajoute un
        if (times2.size() % 2 != 0) {
            times2.add(LocalDateTime.now());
        }
        return calculateTimes(times2);
    }

    public static String report(final Iterable<LocalDateTime> times, final LocalDate predicate) {
        return formatter.print(calculateTimes(Iterables.filter(times, new LocalDatePredicate(predicate))));
    }

    public static String report(final Iterable<LocalDateTime> times, final LocalDate start, final LocalDate end) {
        return formatter.print(calculateTimes(Iterables.filter(times, new BetweenLocalDatePredicate(start, end))));
    }

    public static List<LocalDateTime> loadTimes(final File file) {
        final List<LocalDateTime> times = new ArrayList<LocalDateTime>();
        try {
            final Scanner scanner = new Scanner(file);

            while (scanner.hasNext()) {
                final String time = scanner.nextLine();
                times.add(LocalDateTime.parse(time));
            }
            scanner.close();
        } catch (final Exception e) {
            // TODO manage exception
            e.printStackTrace();
        }

        return times;
    }

    public static void sync(final List<LocalDateTime> times, final File file) {
        if (file.canWrite()) {
            try {
                final PrintWriter writer = new PrintWriter(file);

                for (final LocalDateTime timeLog : times) {
                    writer.println(timeLog.toString());
                }
                writer.close();
            } catch (final Exception e) {
                // TODO manage exception
                e.printStackTrace();
            }
        }
    }

    private static class LocalDatePredicate implements Predicate<LocalDateTime> {

        private final LocalDate dateRef;

        public LocalDatePredicate(final LocalDate dateRef) {
            this.dateRef = dateRef;
        }

        public boolean apply(final LocalDateTime date) {
            return dateRef.equals(date.toLocalDate());
        }
    }

    private static class BetweenLocalDatePredicate implements Predicate<LocalDateTime> {

        private final LocalDate start;
        private final LocalDate end;

        public BetweenLocalDatePredicate(final LocalDate start, final LocalDate end) {
            this.start = start;
            this.end = end;
        }

        public boolean apply(final LocalDateTime date) {
            return start.isBefore(date.toLocalDate()) && end.isAfter(date.toLocalDate());
        }
    }
}
