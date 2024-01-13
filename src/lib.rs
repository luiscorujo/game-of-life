mod utils;

use rand::Rng;
use wasm_bindgen::prelude::*;
extern crate js_sys;
extern crate fixedbitset;
use fixedbitset::FixedBitSet;

extern crate web_sys;
use web_sys::console;

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: FixedBitSet,
    speed: u32,
    tick: u32,
}

#[wasm_bindgen]
impl Universe {
    pub fn new() -> Universe {
        // utils::set_panic_hook(); // For debugging
        let width = 64;
        let height = 32;
        let speed = 5;
        let tick = 0;
        let universe_size = (width * height) as usize;

        let mut cells = FixedBitSet::with_capacity(universe_size);
        for i in 0..universe_size {
            cells.set(i, false);
        }

        Universe {
            width,
            height,
            cells,
            speed,
            tick
        }
    }

    pub fn new_with_parameters(width: u32, height: u32) -> Universe {
        let speed = 5;
        let tick = 0;
        let universe_size = (width * height) as usize;

        let mut cells = FixedBitSet::with_capacity(universe_size);
        for i in 0..universe_size {
            cells.set(i, false);
        }

        Universe {
            width,
            height,
            cells,
            speed,
            tick
        }
    }

    pub fn set_initial_cells_dead(&mut self) {
        let size = (self.width * self.height) as usize;
        self.cells = FixedBitSet::with_capacity(size);
        for i in 0..size {
            self.cells.set(i, false)
        }
    }

    pub fn set_random_cells(&mut self) {
        let size = (self.width * self.height) as usize;
        self.cells = FixedBitSet::with_capacity(size);
        for i in 0..size {
            if rand::thread_rng().gen::<f64>() < 0.25 {
                self.cells.set(i, true)
            } else {
                self.cells.set(i, false)
            }
        }
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    /// Set the width of the universe.
    ///
    /// Resets all cells to the dead state.
    pub fn set_width(&mut self, width: u32) {
        self.width = width;
        self.set_initial_cells_dead();
    }

    /// Set the speed of the universe.
    pub fn set_speed(&mut self, speed: u32) {
        self.speed = speed;
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    /// Set the height of the universe.
    ///
    /// Resets all cells to the dead state.
    pub fn set_height(&mut self, height: u32) {
        self.height = height;
        self.set_initial_cells_dead();
    }

    pub fn cells(&self) -> *const u32 {
        self.cells.as_slice().as_ptr()
    }

    pub fn toggle_cell(&mut self, row: u32, column: u32) {
        let idx = self.get_index(row, column);
        let mut cells = self.cells.clone();
        cells.toggle(idx);
        self.cells = cells;
    }

    pub fn tick(&mut self) {
        // let _timer = Timer::new("Universe::tick");
        if self.tick % self.speed == 0 {
            let mut next = self.cells.clone();

            for row in 0..self.height {
                for col in 0..self.width {
                    let idx = self.get_index(row, col);
                    let cell = self.cells[idx];
                    let live_neighbors = self.live_neighbor_count(row, col);

                    next.set(idx, match (cell, live_neighbors) {
                        // Rule 1: Any live cell with fewer than two live neighbours
                        // dies, as if caused by underpopulation.
                        (true, x) if x < 2 => {
                            log!("The cell dies by underpopulation");
                            false
                        },
                        // Rule 2: Any live cell with two or three live neighbours
                        // lives on to the next generation.
                        (true, 2) | (true, 3) => {
                            log!("The cell stays alive");
                            true
                        },
                        // Rule 3: Any live cell with more than three live
                        // neighbours dies, as if by overpopulation.
                        (true, x) if x > 3 => {
                            log!("The cell dies by overpopulation");
                            false
                        },
                        // Rule 4: Any dead cell with exactly three live neighbours
                        // becomes a live cell, as if by reproduction.
                        (false, 3) => {
                            log!("The cell becomes alive");
                            true
                        },
                        // All other cells remain in the same state.
                        (otherwise, _) => {
                            log!("The cell stays the same");
                            otherwise
                        }
                    });
                }
            }
            self.cells = next;
        }
        self.tick = (self.tick + 1 ) % 1000;
    }

    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;
        for delta_row in [self.height - 1, 0, 1].iter().cloned() {
            for delta_col in [self.width - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }
                let neighbor_row = (row + delta_row) % self.height;
                let neighbor_col = (column + delta_col) % self.width;
                let idx = self.get_index(neighbor_row, neighbor_col);
                count += self.cells[idx] as u8;
            }
        }
        count
    }
}

// We don't use #[wasm_bindgen] because we only want these function for testing
// and we don't want to expose them to js
impl Universe {
    pub fn set_cells(&mut self, cells: &[(u32, u32)]) {
        for (row, col) in cells.iter().cloned() {
            self.cells.set(self.get_index(row, col), true);
        }
    }

    pub fn get_cells_ref(&self) -> &FixedBitSet {
        &self.cells
    }
}


// Helpers to measure performance
pub struct Timer<'a> {
    name: &'a str,
}

impl<'a> Timer<'a> {
    pub fn new(name: &'a str) -> Timer<'a> {
        console::time_with_label(name);
        Timer { name }
    }
}

impl<'a> Drop for Timer<'a> {
    fn drop(&mut self) {
        console::time_end_with_label(self.name);
    }
}
