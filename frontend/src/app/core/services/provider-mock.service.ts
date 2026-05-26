import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Provider } from '../models/provider.model';

@Injectable({
  providedIn: 'root'
})
export class ProviderMockService {
  private providers: Provider[] = [
    {
      id: 1,
      name: 'Dr. Amelia Carter',
      specialty: 'Family Medicine',
      department: 'Primary Care',
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 2,
      name: 'Dr. Ryan Patel',
      specialty: 'Cardiology',
      department: 'Cardiology',
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 3,
      name: 'Dr. Sophia Nguyen',
      specialty: 'Pediatrics',
      department: 'Pediatrics',
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 4,
      name: 'Dr. Noah Kim',
      specialty: 'Orthopedics',
      department: 'Orthopedics',
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 5,
      name: 'Dr. Olivia Garcia',
      specialty: 'Dermatology',
      department: 'Dermatology',
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1594824476968-48fd8d0c0276?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 6,
      name: 'Dr. James Wilson',
      specialty: 'Internal Medicine',
      department: 'Internal Medicine',
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 7,
      name: 'Dr. Emily Martinez',
      specialty: 'Endocrinology',
      department: 'Endocrinology',
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 8,
      name: 'Dr. Michael Chen',
      specialty: 'Neurology',
      department: 'Neurology',
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 9,
      name: 'Dr. Sarah Thompson',
      specialty: 'Gynecology',
      department: 'Women\'s Health',
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 10,
      name: 'Dr. David Rodriguez',
      specialty: 'Pulmonology',
      department: 'Pulmonology',
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1594824476968-48fd8d0c0276?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 11,
      name: 'Dr. Lisa Anderson',
      specialty: 'Psychiatry',
      department: 'Mental Health',
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=faces'
    },
    {
      id: 12,
      name: 'Dr. Robert Taylor',
      specialty: 'Gastroenterology',
      department: 'Gastroenterology',
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=faces'
    }
  ];

  getProviders(): Observable<Provider[]> {
    return of([...this.providers]).pipe(delay(300));
  }

  getProviderById(id: number): Observable<Provider> {
    const provider = this.providers.find(p => p.id === id);
    if (provider) {
      return of({ ...provider }).pipe(delay(200));
    }
    return of(null as any).pipe(delay(200));
  }

  seedDemoProviders(): Observable<Provider[]> {
    // Reset to demo providers with all 12 providers
    this.providers = [
      { id: 1, name: 'Dr. Amelia Carter', specialty: 'Family Medicine', department: 'Primary Care', active: true, imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=faces' },
      { id: 2, name: 'Dr. Ryan Patel', specialty: 'Cardiology', department: 'Cardiology', active: true, imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=faces' },
      { id: 3, name: 'Dr. Sophia Nguyen', specialty: 'Pediatrics', department: 'Pediatrics', active: true, imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=faces' },
      { id: 4, name: 'Dr. Noah Kim', specialty: 'Orthopedics', department: 'Orthopedics', active: true, imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=faces' },
      { id: 5, name: 'Dr. Olivia Garcia', specialty: 'Dermatology', department: 'Dermatology', active: true, imageUrl: 'https://images.unsplash.com/photo-1594824476968-48fd8d0c0276?w=400&h=400&fit=crop&crop=faces' },
      { id: 6, name: 'Dr. James Wilson', specialty: 'Internal Medicine', department: 'Internal Medicine', active: true, imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=faces' },
      { id: 7, name: 'Dr. Emily Martinez', specialty: 'Endocrinology', department: 'Endocrinology', active: true, imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=faces' },
      { id: 8, name: 'Dr. Michael Chen', specialty: 'Neurology', department: 'Neurology', active: true, imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=faces' },
      { id: 9, name: 'Dr. Sarah Thompson', specialty: 'Gynecology', department: 'Women\'s Health', active: true, imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=faces' },
      { id: 10, name: 'Dr. David Rodriguez', specialty: 'Pulmonology', department: 'Pulmonology', active: true, imageUrl: 'https://images.unsplash.com/photo-1594824476968-48fd8d0c0276?w=400&h=400&fit=crop&crop=faces' },
      { id: 11, name: 'Dr. Lisa Anderson', specialty: 'Psychiatry', department: 'Mental Health', active: true, imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=faces' },
      { id: 12, name: 'Dr. Robert Taylor', specialty: 'Gastroenterology', department: 'Gastroenterology', active: true, imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=faces' }
    ];
    return of([...this.providers]).pipe(delay(300));
  }
}

