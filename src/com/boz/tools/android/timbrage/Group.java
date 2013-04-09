package com.boz.tools.android.timbrage;

import java.util.ArrayList;
import java.util.List;

import org.joda.time.LocalDate;
import org.joda.time.LocalDateTime;

public class Group implements Comparable<Group> {
    final LocalDate date;
    final List<LocalDateTime> times = new ArrayList<LocalDateTime>();

    public Group(final LocalDate date) {
        this.date = date;
    }

    public int compareTo(Group another) {
        return date.compareTo(another.date);
    }

    public void add(LocalDateTime time) {
        times.add(time);
    }

    public void remove(LocalDateTime time) {
        times.remove(time);
    }
}