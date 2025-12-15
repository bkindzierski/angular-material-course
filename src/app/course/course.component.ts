import {AfterViewInit, Component, ElementRef, OnInit, viewChild, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import {Course} from "../model/course";
import {CoursesService} from "../services/courses.service";
import {debounceTime, distinctUntilChanged, startWith, tap, delay, catchError, throwIfEmpty, finalize} from 'rxjs/operators';
import {merge, fromEvent, throwError} from "rxjs";
import { Lesson } from '../model/lesson';
import { SelectionModel } from '@angular/cdk/collections';


@Component({
    selector: 'course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.scss'],
    standalone: false
})
export class CourseComponent implements OnInit, AfterViewInit {

    course:Course;

    lessons: Lesson[] = [];;

    loading = false;

    @ViewChild(MatPaginator)
    paginator:MatPaginator;
    
    @ViewChild(MatSort)
    sort: MatSort;

    selection = new SelectionModel<Lesson>(true, []);

    constructor(private route: ActivatedRoute,
                private coursesService: CoursesService) {

    }
    displayedColumns=['select','seqNo','description', 'duration']

    expandedLesson:Lesson = null;

    ngOnInit() {

      this.course = this.route.snapshot.data["course"];
      
      this.loadLessonPage();

    }

    onLessonToggled(lesson:Lesson){
      this.selection.toggle(lesson);
      console.log(this.selection.selected)
    }

    loadLessonPage(){
      this.loading =true;
      this.coursesService.findLessons(
          this.course.id,
          this.sort?.direction ?? 'asc',
          this.paginator?.pageIndex ?? 0,
          this.paginator?.pageSize ?? 3,
          this.sort?.active ?? 'seqNo')
      .pipe(
        tap(lessons => this.lessons = lessons),
        catchError(err=>{
          console.log('Error Loading Lessons', err);
          alert("Error Loading Lessons");
          return throwError(err);
        }),
        finalize(()=>this.loading=false)
      )
      .subscribe();
      
    }
    
    onToggleLesson(lesson:Lesson){
      if(lesson == this.expandedLesson){
        this.expandedLesson = null;
      }
      else{
        this.expandedLesson = lesson;
      }
    }
    
    ngAfterViewInit() {

      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      /**mergin to subscribe calls to the paginator */
      merge(this.sort.sortChange, this.paginator.page).pipe(
        tap(() => this.loadLessonPage())
      )
      .subscribe()

      //merged into above
      // this.sort.sortChange
      // .pipe(() => this.loadLessonPage())
      // .subscribe()

      // this.paginator?.page
      // .pipe(
      //   tap(() => this.loadLessonPage())
      // )
      // .subscribe()
    }

    isAllSelected(){
      return this.selection.selected?.length == this.lessons?.length
    }
    toggleAll(){
      if(this.isAllSelected()){
        this.selection.clear()
      }
      else{
        this.selection.select(...this.lessons)
      }
    }

}
