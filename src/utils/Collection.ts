/**
 * A configured cache holder for the package
 */
export default class Collection<K, V> extends Map<K, V> {

    /**
     * The maximum size for the collection!
     */
    maxSize?: number;

    set(key: K, value: V) {
        if(this.maxSize && this.size >= this.maxSize) return this;
        return super.set(key, value);
    }

    /**
     * Returns an array of values!
     */
    array() {
        return [...this.values()];
    }

    /**
     * Returns the first element of the collection
     */
    first(): V | undefined {
        return this.values().next().value;
    }

    /**
     * Returns the last element of the collection
     */
    last(): V | undefined {
        const arr = this.array();
        return arr[arr.length - 1];
    }

    /**
     * Returns the random element of the array
     */
    random(): V | undefined {
        const arr = this.array();
        return arr[Math.floor(Math.random() * arr.length)];
    }

    filter(callback: (value: V, key: K) => boolean): V[] {
        const arr: V[] = [];

        for (const [key, value] of this.entries()) {
            if(callback(value, key)) arr.push(value);
        }

        return arr;
    }

    find(callback: (value: V, key: K) => boolean): V | void {
        for (const [key, value] of this.entries()) {
            if(callback(value, key)) return value;
        }
    }

    map<T = V>(callback: (value: V, key: K) => T): T[] {
        const arr: T[] = [];
        for (const [key, value] of this.entries()) arr.push(callback(value, key));
        return arr;
    }

    get some() {
        return this.array().some;
    }

    /**
     * Same as filter method but this method returns Collection as a response instead of any array!
     * 
     * @param callback Your filter function
     * @example const newCol = oldCol.filterMap(Boolean);
     */
    filterMap(callback: (value: V, key: K) => boolean): Collection<K, V> {
        const col = new Collection<K, V>();

        for (const [key, value] of this.entries()) {
            if(callback(value, key)) col.set(key, value);
        }

        return col;
    }

}