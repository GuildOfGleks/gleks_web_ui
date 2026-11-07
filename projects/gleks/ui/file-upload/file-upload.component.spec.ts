import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { GOG_CONFIG } from '@guildofgleks/ui/shared';
import {
  FileUploadComponent,
  type GogFileRejection,
  gogFileMatchesAccept,
} from './file-upload.component';

const file = (name: string, type: string, size = 10) =>
  new File([new Uint8Array(size)], name, { type });

describe('gogFileMatchesAccept', () => {
  it('takes everything when accept is empty', () => {
    expect(gogFileMatchesAccept(file('a.exe', 'application/x-msdownload'), '')).toBe(true);
  });

  it('matches extensions case-insensitively, wildcard types and exact types', () => {
    expect(gogFileMatchesAccept(file('Report.PDF', 'application/pdf'), '.pdf')).toBe(true);
    expect(gogFileMatchesAccept(file('cat.png', 'image/png'), 'image/*')).toBe(true);
    expect(gogFileMatchesAccept(file('a.json', 'application/json'), 'application/json')).toBe(true);
    expect(
      gogFileMatchesAccept(file('setup.exe', 'application/x-msdownload'), '.pdf, image/*'),
    ).toBe(false);
  });
});

@Component({
  imports: [FileUploadComponent, ReactiveFormsModule],
  template: `
    <gog-file-upload
      label="Attachments"
      hint="PDF or images"
      [accept]="accept()"
      [maxSize]="maxSize()"
      [maxFiles]="maxFiles()"
      [multiple]="multiple()"
      [formControl]="control"
      (gogReject)="rejected = $event"
    />
  `,
})
class Host {
  readonly accept = signal('.pdf,image/*');
  readonly maxSize = signal<number | null>(100);
  readonly maxFiles = signal<number | null>(null);
  readonly multiple = signal(true);
  readonly control = new FormControl<File[]>([], { nonNullable: true });
  rejected: GogFileRejection[] = [];
}

async function render(providers: unknown[] = []) {
  await TestBed.configureTestingModule({
    imports: [Host],
    providers: providers as never[],
  }).compileComponents();
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  fixture.detectChanges();
  const root = fixture.nativeElement as HTMLElement;
  const input = root.querySelector<HTMLInputElement>('input[type="file"]')!;
  const zone = root.querySelector<HTMLElement>('.gog-file-upload__zone')!;
  const names = () =>
    Array.from(root.querySelectorAll('.gog-file-upload__name')).map((el) => el.textContent?.trim());
  const live = () => root.querySelector('[aria-live="polite"]')!.textContent?.trim();
  const settle = async () => {
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const pick = async (...files: File[]) => {
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    input.dispatchEvent(new Event('change'));
    await settle();
  };
  const drop = async (...files: File[]) => {
    const event = new Event('drop', { bubbles: true, cancelable: true }) as DragEvent;
    Object.defineProperty(event, 'dataTransfer', { value: { files, types: ['Files'] } });
    zone.dispatchEvent(event);
    await settle();
    return event;
  };
  return { fixture, root, input, zone, names, live, pick, drop, settle };
}

describe('FileUploadComponent', () => {
  it('is a real file input, named by its label and described by its hint', async () => {
    const { root, input } = await render();
    const label = root.querySelector('label')!;
    expect(label.getAttribute('for')).toBe(input.id);
    expect(input.getAttribute('accept')).toBe('.pdf,image/*');
    expect(input.multiple).toBe(true);
    const hint = root.querySelector('.gog-file-upload__hint')!;
    expect(input.getAttribute('aria-describedby')).toBe(hint.id);
  });

  it('adds picked files to the value and the form control, and says so', async () => {
    const { fixture, names, live, pick } = await render();
    await pick(file('a.pdf', 'application/pdf'), file('b.png', 'image/png'));
    expect(names()).toEqual(['a.pdf', 'b.png']);
    expect(fixture.componentInstance.control.value.map((f) => f.name)).toEqual(['a.pdf', 'b.png']);
    expect(live()).toBe('2 files added');
  });

  it('checks a dropped file against accept, which the browser never does', async () => {
    const { fixture, names, live, drop } = await render();
    const event = await drop(
      file('setup.exe', 'application/x-msdownload'),
      file('c.pdf', 'application/pdf'),
    );

    expect(event.defaultPrevented).toBe(true);
    expect(names()).toEqual(['c.pdf']);
    expect(fixture.componentInstance.rejected.map((r) => [r.file.name, r.reason])).toEqual([
      ['setup.exe', 'type'],
    ]);
    expect(live()).toContain('setup.exe was not added: its type is not accepted');
  });

  it('refuses a file over maxSize', async () => {
    const { fixture, names, pick } = await render();
    await pick(file('big.pdf', 'application/pdf', 500));
    expect(names()).toEqual([]);
    expect(fixture.componentInstance.rejected[0].reason).toBe('size');
  });

  it('refuses files past maxFiles, counting those already chosen', async () => {
    const { fixture, names, pick } = await render();
    fixture.componentInstance.maxFiles.set(2);
    await pick(file('a.pdf', 'application/pdf'));
    await pick(file('b.pdf', 'application/pdf'), file('c.pdf', 'application/pdf'));
    expect(names()).toEqual(['a.pdf', 'b.pdf']);
    expect(fixture.componentInstance.rejected.map((r) => [r.file.name, r.reason])).toEqual([
      ['c.pdf', 'count'],
    ]);
  });

  it('holds one file without multiple: a new one replaces it', async () => {
    const { fixture, names, pick } = await render();
    fixture.componentInstance.multiple.set(false);
    await pick(file('a.pdf', 'application/pdf'));
    await pick(file('b.pdf', 'application/pdf'));
    expect(names()).toEqual(['b.pdf']);
  });

  it('removes a file and hands focus to the remove button that took its place', async () => {
    const { root, names, pick, settle } = await render();
    await pick(file('a.pdf', 'application/pdf'), file('b.pdf', 'application/pdf'));
    const first = root.querySelector<HTMLButtonElement>('.gog-file-upload__remove')!;
    expect(first.getAttribute('aria-label')).toBe('Remove a.pdf');
    first.focus();
    first.click();
    await settle();
    expect(names()).toEqual(['b.pdf']);
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Remove b.pdf');
  });

  it('focuses the input once the last file is removed', async () => {
    const { root, input, pick, settle } = await render();
    await pick(file('a.pdf', 'application/pdf'));
    root.querySelector<HTMLButtonElement>('.gog-file-upload__remove')!.click();
    await settle();
    expect(document.activeElement).toBe(input);
  });

  it('takes the value a form control writes, and follows its disabled state', async () => {
    const { fixture, names, input, settle } = await render();
    fixture.componentInstance.control.setValue([file('from-form.pdf', 'application/pdf')]);
    await settle();
    expect(names()).toEqual(['from-form.pdf']);
    fixture.componentInstance.control.disable();
    await settle();
    expect(input.disabled).toBe(true);
  });

  it('ignores a drop while disabled, and still stops the browser opening the file', async () => {
    const { fixture, names, drop, settle } = await render();
    fixture.componentInstance.control.disable();
    await settle();
    const event = await drop(file('a.pdf', 'application/pdf'));
    expect(event.defaultPrevented).toBe(true);
    expect(names()).toEqual([]);
  });

  it('takes its words from GOG_CONFIG.labels', async () => {
    const { root, live, pick } = await render([
      {
        provide: GOG_CONFIG,
        useValue: {
          labels: {
            fileDrop: 'Dateien hierher ziehen oder',
            fileBrowse: 'durchsuchen',
            filesAdded: (n: number) => `${n} hinzugefügt`,
          },
        },
      },
    ]);
    expect(root.querySelector('.gog-file-upload__prompt')!.textContent).toContain('durchsuchen');
    await pick(file('a.pdf', 'application/pdf'));
    expect(live()).toBe('1 hinzugefügt');
  });
});
